/**
 * ToolExecutionBridge Tests
 *
 * Verifies the read-tool-to-git-service bridge.
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
