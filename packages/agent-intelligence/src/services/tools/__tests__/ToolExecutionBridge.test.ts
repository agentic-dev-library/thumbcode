/**
 * ToolExecutionBridge Tests
 *
 * Verifies the read and write tool-to-git-service bridge,
 * including staged change tracking and approval-triggered commits.
 * All git and file system operations are mocked.
 */

import { ToolExecutionBridge } from '../ToolExecutionBridge';
import type { ToolBridgeDependencies } from '../types';

function createMockDeps(): ToolBridgeDependencies {
  return {
    diffService: {
      status: vi.fn().mockResolvedValue({
        success: true,
        data: [
          { path: 'src/index.ts', status: 'modified', staged: false },
          { path: 'src/new-file.ts', status: 'added', staged: true },
        ],
      }),
      diff: vi.fn().mockResolvedValue({
        success: true,
        data: {
          files: [
            {
              path: 'src/index.ts',
              type: 'modify',
              additions: 5,
              deletions: 2,
              patch: '+new\n-old',
            },
          ],
          stats: { filesChanged: 1, additions: 5, deletions: 2 },
        },
      }),
      diffWorkingDir: vi.fn().mockResolvedValue({
        success: true,
        data: {
          files: [
            {
              path: 'src/index.ts',
              type: 'modify',
              additions: 3,
              deletions: 1,
              patch: '+line\n-old',
            },
            { path: 'src/utils.ts', type: 'add', additions: 10, deletions: 0, patch: '+util code' },
          ],
          stats: { filesChanged: 2, additions: 13, deletions: 1 },
        },
      }),
    },
    cloneService: {
      isRepository: vi.fn().mockResolvedValue(true),
      getHead: vi.fn().mockResolvedValue({ success: true, data: 'abc123' }),
    },
    branchService: {
      currentBranch: vi.fn().mockResolvedValue({ success: true, data: 'main' }),
      listBranches: vi.fn().mockResolvedValue({
        success: true,
        data: [
          { name: 'main', current: true, commit: 'abc123' },
          { name: 'feature', current: false, commit: 'def456' },
        ],
      }),
    },
    commitService: {
      log: vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            oid: 'abc123',
            message: 'feat: initial',
            author: { name: 'Dev', email: 'dev@test.com' },
          },
        ],
      }),
      stage: vi.fn().mockResolvedValue({ success: true }),
      unstage: vi.fn().mockResolvedValue({ success: true }),
      commit: vi.fn().mockResolvedValue({ success: true, data: 'def456' }),
    },
    fileSystem: {
      readFile: vi.fn().mockImplementation(async (path: string) => {
        const files: Record<string, string> = {
          '/workspace/src/index.ts': 'export const hello = "world";',
          '/workspace/src/utils.ts': 'export function add(a: number, b: number) { return a + b; }',
          '/workspace/test-results.json': '{"tests": 10, "passed": 8, "failed": 2}',
          '/workspace/coverage/coverage-summary.json': '{"total": {"statements": {"pct": 80}}}',
        };
        const content = files[path];
        if (content !== undefined) return content;
        throw new Error(`ENOENT: ${path}`);
      }),
      readDir: vi.fn().mockImplementation(async (path: string) => {
        const dirs: Record<string, string[]> = {
          '/workspace': ['src', 'package.json'],
          '/workspace/src': ['index.ts', 'utils.ts'],
        };
        const entries = dirs[path];
        if (entries) return entries;
        throw new Error(`ENOENT: ${path}`);
      }),
      stat: vi.fn().mockImplementation(async (path: string) => {
        if (path.endsWith('.ts') || path.endsWith('.json')) {
          return { isFile: true, isDirectory: false };
        }
        return { isFile: false, isDirectory: true };
      }),
      writeFile: vi.fn().mockResolvedValue(undefined),
      deleteFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe('ToolExecutionBridge', () => {
  let bridge: ToolExecutionBridge;
  let deps: ToolBridgeDependencies;
  const workspaceDir = '/workspace';

  beforeEach(() => {
    deps = createMockDeps();
    bridge = new ToolExecutionBridge(deps);
  });

  describe('read_file', () => {
    it('should read file content from workspace', async () => {
      const result = await bridge.execute('read_file', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toBe('export const hello = "world";');
      expect(deps.fileSystem.readFile).toHaveBeenCalledWith('/workspace/src/index.ts');
    });

    it('should return error when path is missing', async () => {
      const result = await bridge.execute('read_file', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires a "path" parameter');
    });

    it('should return error when file does not exist', async () => {
      const result = await bridge.execute('read_file', { path: 'nonexistent.ts' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });
  });

  describe('list_directory', () => {
    it('should list directory contents', async () => {
      const result = await bridge.execute('list_directory', { path: '.' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('src');
      expect(result.output).toContain('package.json');
    });

    it('should list recursively when requested', async () => {
      const result = await bridge.execute(
        'list_directory',
        { path: '.', recursive: true },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('src');
      expect(result.output).toContain('src/index.ts');
    });

    it('should return error for non-existent directory', async () => {
      const result = await bridge.execute('list_directory', { path: 'nonexistent' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Directory not found');
    });
  });

  describe('get_diff', () => {
    it('should get working directory diff when no base_ref', async () => {
      const result = await bridge.execute('get_diff', {}, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('2 file(s) changed');
      expect(result.output).toContain('src/index.ts');
      expect(result.output).toContain('src/utils.ts');
      expect(deps.diffService.diffWorkingDir).toHaveBeenCalledWith(workspaceDir);
    });

    it('should filter diff by file path', async () => {
      const result = await bridge.execute('get_diff', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('src/index.ts');
      expect(result.output).not.toContain('src/utils.ts');
    });

    it('should diff against base_ref when provided', async () => {
      const result = await bridge.execute('get_diff', { base_ref: 'main' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(deps.cloneService.getHead).toHaveBeenCalledWith(workspaceDir);
      expect(deps.diffService.diff).toHaveBeenCalledWith(workspaceDir, 'main', 'abc123');
    });

    it('should return error when diff service fails', async () => {
      vi.mocked(deps.diffService.diffWorkingDir).mockResolvedValueOnce({
        success: false,
        error: 'Not a git repository',
      });

      const result = await bridge.execute('get_diff', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not a git repository');
    });

    it('should return error when HEAD cannot be resolved for base_ref diff', async () => {
      vi.mocked(deps.cloneService.getHead).mockResolvedValueOnce({
        success: false,
        error: 'HEAD not found',
      });

      const result = await bridge.execute('get_diff', { base_ref: 'main' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Could not resolve HEAD');
    });

    it('should show "No changes found" when diff is empty', async () => {
      vi.mocked(deps.diffService.diffWorkingDir).mockResolvedValueOnce({
        success: true,
        data: {
          files: [],
          stats: { filesChanged: 0, additions: 0, deletions: 0 },
        },
      });

      const result = await bridge.execute('get_diff', {}, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toBe('No changes found.');
    });
  });

  describe('search_code', () => {
    it('should find matches in workspace files', async () => {
      const result = await bridge.execute('search_code', { pattern: 'export' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('match(es) found');
      expect(result.output).toContain('index.ts');
    });

    it('should return error when pattern is missing', async () => {
      const result = await bridge.execute('search_code', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires a "pattern" parameter');
    });

    it('should filter by file_pattern', async () => {
      const result = await bridge.execute(
        'search_code',
        { pattern: 'export', file_pattern: '*.ts' },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('match(es) found');
    });

    it('should report no matches when pattern does not match', async () => {
      const result = await bridge.execute(
        'search_code',
        { pattern: 'nonexistentpattern12345' },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('No matches found');
    });
  });

  describe('run_tests', () => {
    it('should read test results from workspace', async () => {
      const result = await bridge.execute('run_tests', {}, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Test results');
      expect(result.output).toContain('"tests": 10');
    });

    it('should include coverage label when requested', async () => {
      const result = await bridge.execute('run_tests', { coverage: true }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Test results with coverage');
    });

    it('should return error when no test results found', async () => {
      vi.mocked(deps.fileSystem.readFile).mockRejectedValue(new Error('ENOENT'));

      const result = await bridge.execute('run_tests', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No test results found');
    });
  });

  describe('get_coverage', () => {
    it('should read coverage report', async () => {
      const result = await bridge.execute('get_coverage', { format: 'json' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Coverage report');
      expect(result.output).toContain('statements');
    });

    it('should return error when coverage report not found', async () => {
      vi.mocked(deps.fileSystem.readFile).mockRejectedValue(new Error('ENOENT'));

      const result = await bridge.execute('get_coverage', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Coverage report not found');
    });
  });

  describe('analyze_test_results', () => {
    it('should read and return test results', async () => {
      const result = await bridge.execute('analyze_test_results', {}, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Test analysis');
    });

    it('should use custom results_path', async () => {
      const result = await bridge.execute(
        'analyze_test_results',
        { results_path: 'custom-results.json' },
        workspaceDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('custom-results.json');
    });
  });

  describe('unknown tool', () => {
    it('should return error for unknown tool name', async () => {
      const result = await bridge.execute('nonexistent_tool', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown tool: nonexistent_tool');
    });
  });

  describe('write_file', () => {
    it('should write file content and stage it', async () => {
      const result = await bridge.execute(
        'write_file',
        { path: 'src/index.ts', content: 'new content' },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('File written and staged');
      expect(deps.fileSystem.writeFile).toHaveBeenCalledWith(
        '/workspace/src/index.ts',
        'new content'
      );
      expect(deps.commitService.stage).toHaveBeenCalledWith({
        dir: workspaceDir,
        filepath: 'src/index.ts',
      });
    });

    it('should return error when path is missing', async () => {
      const result = await bridge.execute('write_file', { content: 'data' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires a "path" parameter');
    });

    it('should return error when content is missing', async () => {
      const result = await bridge.execute('write_file', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires a "content" parameter');
    });

    it('should return error when file does not exist', async () => {
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await bridge.execute(
        'write_file',
        { path: 'nonexistent.ts', content: 'data' },
        workspaceDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
      expect(result.error).toContain('Use create_file');
    });

    it('should return error when writeFile fails', async () => {
      vi.mocked(deps.fileSystem.writeFile).mockRejectedValueOnce(new Error('Disk full'));

      const result = await bridge.execute(
        'write_file',
        { path: 'src/index.ts', content: 'data' },
        workspaceDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Disk full');
    });

    it('should track the change with agent context', async () => {
      await bridge.execute(
        'write_file',
        {
          path: 'src/index.ts',
          content: 'new',
          agent_role: 'implementer',
          task_description: 'update logic',
        },
        workspaceDir
      );

      const staged = bridge.getStagedChanges(workspaceDir);
      expect(staged).toHaveLength(1);
      expect(staged[0]).toEqual({
        path: 'src/index.ts',
        type: 'write',
        agentRole: 'implementer',
        taskDescription: 'update logic',
      });
    });
  });

  describe('create_file', () => {
    it('should create a new file and stage it', async () => {
      // Mock stat to throw for new file (file doesn't exist yet)
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await bridge.execute(
        'create_file',
        { path: 'src/new-component.ts', content: 'export default {}' },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('File created and staged');
      expect(deps.fileSystem.writeFile).toHaveBeenCalledWith(
        '/workspace/src/new-component.ts',
        'export default {}'
      );
      expect(deps.commitService.stage).toHaveBeenCalledWith({
        dir: workspaceDir,
        filepath: 'src/new-component.ts',
      });
    });

    it('should return error when path is missing', async () => {
      const result = await bridge.execute('create_file', { content: 'data' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires a "path" parameter');
    });

    it('should return error when file already exists', async () => {
      const result = await bridge.execute(
        'create_file',
        { path: 'src/index.ts', content: 'data' },
        workspaceDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('File already exists');
      expect(result.error).toContain('Use write_file');
    });

    it('should create file with empty content when content is omitted', async () => {
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await bridge.execute(
        'create_file',
        { path: 'src/empty-file.ts' },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(deps.fileSystem.writeFile).toHaveBeenCalledWith('/workspace/src/empty-file.ts', '');
    });

    it('should create parent directories', async () => {
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await bridge.execute(
        'create_file',
        { path: 'src/deep/nested/file.ts', content: 'data' },
        workspaceDir
      );

      expect(result.success).toBe(true);
      expect(deps.fileSystem.mkdir).toHaveBeenCalledWith('/workspace/src/deep/nested');
    });

    it('should return error when writeFile fails', async () => {
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));
      vi.mocked(deps.fileSystem.writeFile).mockRejectedValueOnce(new Error('Permission denied'));

      const result = await bridge.execute(
        'create_file',
        { path: 'src/new-file.ts', content: 'data' },
        workspaceDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });
  });

  describe('delete_file', () => {
    it('should delete a file and stage the deletion', async () => {
      const result = await bridge.execute('delete_file', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('File deleted and staged');
      expect(deps.fileSystem.deleteFile).toHaveBeenCalledWith('/workspace/src/index.ts');
      expect(deps.commitService.stage).toHaveBeenCalledWith({
        dir: workspaceDir,
        filepath: 'src/index.ts',
      });
    });

    it('should return error when path is missing', async () => {
      const result = await bridge.execute('delete_file', {}, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires a "path" parameter');
    });

    it('should return error when file does not exist', async () => {
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await bridge.execute('delete_file', { path: 'nonexistent.ts' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should return error when deleteFile fails', async () => {
      vi.mocked(deps.fileSystem.deleteFile).mockRejectedValueOnce(new Error('In use'));

      const result = await bridge.execute('delete_file', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('In use');
    });
  });

  describe('commitStagedChanges', () => {
    const author = { name: 'Agent', email: 'agent@test.com' };

    it('should commit staged changes and return SHA', async () => {
      // Stage a change first
      await bridge.execute(
        'write_file',
        { path: 'src/index.ts', content: 'updated', agent_role: 'implementer' },
        workspaceDir
      );

      const result = await bridge.commitStagedChanges(workspaceDir, author);

      expect(result.success).toBe(true);
      expect(result.sha).toBe('def456');
      expect(result.filesChanged).toBe(1);
      expect(deps.commitService.commit).toHaveBeenCalledWith(
        expect.objectContaining({
          dir: workspaceDir,
          author,
          message: expect.stringContaining('implementer'),
        })
      );
    });

    it('should include agent context in commit message', async () => {
      await bridge.execute(
        'write_file',
        {
          path: 'src/index.ts',
          content: 'x',
          agent_role: 'reviewer',
          task_description: 'fix lint errors',
        },
        workspaceDir
      );

      await bridge.commitStagedChanges(workspaceDir, author);

      const commitCall = vi.mocked(deps.commitService.commit).mock.calls[0][0];
      expect(commitCall.message).toContain('reviewer');
      expect(commitCall.message).toContain('fix lint errors');
      expect(commitCall.message).toContain('src/index.ts');
    });

    it('should return error when no staged changes exist', async () => {
      const result = await bridge.commitStagedChanges(workspaceDir, author);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No staged changes');
    });

    it('should return error when commit fails', async () => {
      await bridge.execute('write_file', { path: 'src/index.ts', content: 'x' }, workspaceDir);

      vi.mocked(deps.commitService.commit).mockResolvedValueOnce({
        success: false,
        error: 'Nothing to commit',
      });

      const result = await bridge.commitStagedChanges(workspaceDir, author);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Nothing to commit');
    });

    it('should clear staged changes after successful commit', async () => {
      await bridge.execute('write_file', { path: 'src/index.ts', content: 'x' }, workspaceDir);

      await bridge.commitStagedChanges(workspaceDir, author);

      expect(bridge.getStagedChanges(workspaceDir)).toHaveLength(0);
    });

    it('should handle commit throwing an error', async () => {
      await bridge.execute('write_file', { path: 'src/index.ts', content: 'x' }, workspaceDir);

      vi.mocked(deps.commitService.commit).mockRejectedValueOnce(new Error('Network error'));

      const result = await bridge.commitStagedChanges(workspaceDir, author);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('discardStagedChanges', () => {
    it('should unstage all changes and clear tracking', async () => {
      await bridge.execute('write_file', { path: 'src/index.ts', content: 'x' }, workspaceDir);
      vi.mocked(deps.fileSystem.stat).mockRejectedValueOnce(new Error('ENOENT'));
      await bridge.execute('create_file', { path: 'src/new-file.ts', content: 'y' }, workspaceDir);

      const result = await bridge.discardStagedChanges(workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('2 staged change(s)');
      expect(deps.commitService.unstage).toHaveBeenCalledWith({
        dir: workspaceDir,
        filepath: ['src/index.ts', 'src/new-file.ts'],
      });
      expect(bridge.getStagedChanges(workspaceDir)).toHaveLength(0);
    });

    it('should return success when no staged changes exist', async () => {
      const result = await bridge.discardStagedChanges(workspaceDir);

      expect(result.success).toBe(true);
      expect(result.output).toContain('No staged changes');
    });

    it('should return error when unstage fails', async () => {
      await bridge.execute('write_file', { path: 'src/index.ts', content: 'x' }, workspaceDir);

      vi.mocked(deps.commitService.unstage).mockRejectedValueOnce(new Error('Unstage error'));

      const result = await bridge.discardStagedChanges(workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unstage error');
    });
  });

  describe('error handling', () => {
    it('should catch and wrap unexpected errors', async () => {
      vi.mocked(deps.fileSystem.readFile).mockImplementation(() => {
        throw new Error('Unexpected crash');
      });

      const result = await bridge.execute('read_file', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle non-Error thrown values', async () => {
      vi.mocked(deps.fileSystem.readFile).mockImplementation(() => {
        throw 'string error';
      });

      const result = await bridge.execute('read_file', { path: 'src/index.ts' }, workspaceDir);

      expect(result.success).toBe(false);
    });
  });
});
