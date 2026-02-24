/**
 * Tool Execution Bridge
 *
 * Connects agent tool definitions to actual git service implementations.
 * Each tool name maps to a specific git service method. The bridge accepts
 * injectable dependencies so it can be tested without real git operations.
 *
 * Handles read tools: read_file, list_directory, get_diff, search_code,
 * run_tests, get_coverage, analyze_test_results.
 *
 * Handles write tools: write_file, create_file, delete_file.
 *
 * Tracks staged changes for the approval-triggered commit flow.
 */

import type { CommitResult, StagedChange, ToolBridgeDependencies, ToolResult } from './types';

export class ToolExecutionBridge {
  private deps: ToolBridgeDependencies;
  private stagedChanges: Map<string, StagedChange[]> = new Map();

  constructor(deps: ToolBridgeDependencies) {
    this.deps = deps;
  }

  /**
   * Execute a tool call by routing to the appropriate git service.
   * Returns a structured ToolResult; never throws.
   */
  async execute(
    toolName: string,
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    try {
      switch (toolName) {
        case 'read_file':
          return this.readFile(input, workspaceDir);
        case 'list_directory':
          return this.listDirectory(input, workspaceDir);
        case 'get_diff':
          return this.getDiff(input, workspaceDir);
        case 'search_code':
          return this.searchCode(input, workspaceDir);
        case 'run_tests':
          return this.runTests(input, workspaceDir);
        case 'get_coverage':
          return this.getCoverage(input, workspaceDir);
        case 'analyze_test_results':
          return this.analyzeTestResults(input, workspaceDir);
        case 'write_file':
          return this.writeFile(input, workspaceDir);
        case 'create_file':
          return this.createFile(input, workspaceDir);
        case 'delete_file':
          return this.deleteFile(input, workspaceDir);
        case 'create_document':
          return this.createDocument(input);
        case 'create_presentation':
          return this.createPresentation(input);
        case 'create_spreadsheet':
          return this.createSpreadsheet(input);
        case 'create_pdf':
          return this.createPdf(input);
        default:
          return { success: false, output: '', error: `Unknown tool: ${toolName}` };
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : `Tool execution failed: ${toolName}`,
      };
    }
  }

  /**
   * read_file: Read workspace file content via the injected file system.
   */
  private async readFile(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const path = input.path as string | undefined;
    if (!path) {
      return { success: false, output: '', error: 'read_file requires a "path" parameter' };
    }

    const fullPath = this.resolvePath(workspaceDir, path);

    try {
      const content = await this.deps.fileSystem.readFile(fullPath);
      return { success: true, output: content };
    } catch {
      return { success: false, output: '', error: `File not found: ${path}` };
    }
  }

  /**
   * list_directory: List files/dirs via the injected file system.
   */
  private async listDirectory(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const path = (input.path as string | undefined) ?? '.';
    const recursive = (input.recursive as boolean | undefined) ?? false;
    const fullPath = this.resolvePath(workspaceDir, path);

    try {
      const entries = await this.listDir(fullPath, recursive);
      return { success: true, output: entries.join('\n') };
    } catch {
      return { success: false, output: '', error: `Directory not found: ${path}` };
    }
  }

  /**
   * get_diff: Get diffs via the injected diff service.
   */
  private async getDiff(input: Record<string, unknown>, workspaceDir: string): Promise<ToolResult> {
    const baseRef = input.base_ref as string | undefined;
    const filePath = input.path as string | undefined;

    // If no base_ref, get working directory diff
    if (!baseRef) {
      const result = await this.deps.diffService.diffWorkingDir(workspaceDir);
      if (!result.success) {
        return { success: false, output: '', error: result.error ?? 'Failed to get diff' };
      }

      const data = result.data;
      if (!data) {
        return { success: false, output: '', error: 'No diff data returned' };
      }
      const filtered = filePath
        ? data.files.filter((f) => f.path === filePath || f.path.startsWith(`${filePath}/`))
        : data.files;

      const output = this.formatDiffOutput(filtered, data.stats);
      return { success: true, output };
    }

    // Diff against a specific ref — need HEAD as the other side
    const headResult = await this.deps.cloneService.getHead(workspaceDir);
    if (!headResult.success || !headResult.data) {
      return { success: false, output: '', error: 'Could not resolve HEAD' };
    }

    const result = await this.deps.diffService.diff(workspaceDir, baseRef, headResult.data);
    if (!result.success) {
      return { success: false, output: '', error: result.error ?? 'Failed to get diff' };
    }

    const data = result.data;
    if (!data) {
      return { success: false, output: '', error: 'No diff data returned' };
    }
    const filtered = filePath
      ? data.files.filter((f) => f.path === filePath || f.path.startsWith(`${filePath}/`))
      : data.files;

    const output = this.formatDiffOutput(filtered, data.stats);
    return { success: true, output };
  }

  /**
   * search_code: Search for patterns in workspace files.
   * Walks the file tree and tests each file against the pattern.
   */
  private async searchCode(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const pattern = input.pattern as string | undefined;
    if (!pattern) {
      return { success: false, output: '', error: 'search_code requires a "pattern" parameter' };
    }

    const filePattern = input.file_pattern as string | undefined;

    try {
      const regex = new RegExp(pattern, 'g');
      const allFiles = await this.listDir(workspaceDir, true);

      // Filter by glob-like pattern (simple suffix match)
      const filesToSearch = filePattern
        ? allFiles.filter((f) => this.matchGlob(f, filePattern))
        : allFiles;

      const matches: string[] = [];

      for (const file of filesToSearch) {
        const fullPath = this.resolvePath(workspaceDir, file);
        try {
          const stat = await this.deps.fileSystem.stat(fullPath);
          if (!stat.isFile) continue;

          const content = await this.deps.fileSystem.readFile(fullPath);
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              matches.push(`${file}:${i + 1}: ${lines[i].trim()}`);
            }
            regex.lastIndex = 0;
          }
        } catch {
          // Skip files that can't be read
        }
      }

      if (matches.length === 0) {
        return { success: true, output: `No matches found for pattern: ${pattern}` };
      }

      return { success: true, output: `${matches.length} match(es) found:\n${matches.join('\n')}` };
    } catch {
      return { success: false, output: '', error: `Invalid search pattern: ${pattern}` };
    }
  }

  /**
   * run_tests: Read test results. In a mobile context, this returns
   * the last known test output rather than actually executing tests.
   */
  private async runTests(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    // Look for test results JSON in standard locations
    const testPattern = (input.test_pattern as string | undefined) ?? '';
    const coverage = (input.coverage as boolean | undefined) ?? false;

    const resultPaths = [
      'test-results.json',
      'jest-results.json',
      'coverage/coverage-summary.json',
    ];

    for (const resultPath of resultPaths) {
      const fullPath = this.resolvePath(workspaceDir, resultPath);
      try {
        const content = await this.deps.fileSystem.readFile(fullPath);
        const label = coverage ? 'Test results with coverage' : 'Test results';
        const patternInfo = testPattern ? ` (pattern: ${testPattern})` : '';
        return { success: true, output: `${label}${patternInfo}:\n${content}` };
      } catch {
        // Try next path
      }
    }

    return {
      success: false,
      output: '',
      error: 'No test results found. Tests may need to be run first.',
    };
  }

  /**
   * get_coverage: Read coverage report from workspace.
   */
  private async getCoverage(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const format = (input.format as string | undefined) ?? 'text';

    const coveragePaths: Record<string, string> = {
      json: 'coverage/coverage-summary.json',
      text: 'coverage/coverage-final.json',
      html: 'coverage/lcov-report/index.html',
    };

    const coveragePath = coveragePaths[format] ?? coveragePaths.json;
    const fullPath = this.resolvePath(workspaceDir, coveragePath);

    try {
      const content = await this.deps.fileSystem.readFile(fullPath);
      return { success: true, output: `Coverage report (${format}):\n${content}` };
    } catch {
      return {
        success: false,
        output: '',
        error: `Coverage report not found at ${coveragePath}. Run tests with --coverage first.`,
      };
    }
  }

  /**
   * analyze_test_results: Read and summarize test results.
   */
  private async analyzeTestResults(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const resultsPath = (input.results_path as string | undefined) ?? 'test-results.json';
    const fullPath = this.resolvePath(workspaceDir, resultsPath);

    try {
      const content = await this.deps.fileSystem.readFile(fullPath);
      return { success: true, output: `Test analysis for ${resultsPath}:\n${content}` };
    } catch {
      return {
        success: false,
        output: '',
        error: `Test results not found at ${resultsPath}`,
      };
    }
  }

  /**
   * write_file: Write content to an existing file and stage it.
   */
  private async writeFile(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const path = input.path as string | undefined;
    const content = input.content as string | undefined;
    if (!path) {
      return { success: false, output: '', error: 'write_file requires a "path" parameter' };
    }
    if (content === undefined) {
      return { success: false, output: '', error: 'write_file requires a "content" parameter' };
    }

    const fullPath = this.resolvePath(workspaceDir, path);

    try {
      // Verify file exists (write_file is for existing files)
      await this.deps.fileSystem.stat(fullPath);
    } catch {
      return {
        success: false,
        output: '',
        error: `File not found: ${path}. Use create_file for new files.`,
      };
    }

    try {
      await this.deps.fileSystem.writeFile(fullPath, content);
      await this.deps.commitService.stage({ dir: workspaceDir, filepath: path });
      this.trackChange(workspaceDir, {
        path,
        type: 'write',
        agentRole: input.agent_role as string | undefined,
        taskDescription: input.task_description as string | undefined,
      });
      return { success: true, output: `File written and staged: ${path}` };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Failed to write file: ${error instanceof Error ? error.message : path}`,
      };
    }
  }

  /**
   * create_file: Create a new file and stage it.
   */
  private async createFile(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const path = input.path as string | undefined;
    const content = (input.content as string | undefined) ?? '';
    if (!path) {
      return { success: false, output: '', error: 'create_file requires a "path" parameter' };
    }

    const fullPath = this.resolvePath(workspaceDir, path);

    // Check if file already exists
    try {
      await this.deps.fileSystem.stat(fullPath);
      return {
        success: false,
        output: '',
        error: `File already exists: ${path}. Use write_file to modify.`,
      };
    } catch {
      // Expected: file should not exist
    }

    try {
      // Ensure parent directory exists
      const parentDir = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
      if (parentDir) {
        const fullParentDir = this.resolvePath(workspaceDir, parentDir);
        try {
          await this.deps.fileSystem.mkdir(fullParentDir);
        } catch {
          // Directory may already exist
        }
      }

      await this.deps.fileSystem.writeFile(fullPath, content);
      await this.deps.commitService.stage({ dir: workspaceDir, filepath: path });
      this.trackChange(workspaceDir, {
        path,
        type: 'create',
        agentRole: input.agent_role as string | undefined,
        taskDescription: input.task_description as string | undefined,
      });
      return { success: true, output: `File created and staged: ${path}` };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Failed to create file: ${error instanceof Error ? error.message : path}`,
      };
    }
  }

  /**
   * delete_file: Delete a file and stage the deletion.
   */
  private async deleteFile(
    input: Record<string, unknown>,
    workspaceDir: string
  ): Promise<ToolResult> {
    const path = input.path as string | undefined;
    if (!path) {
      return { success: false, output: '', error: 'delete_file requires a "path" parameter' };
    }

    const fullPath = this.resolvePath(workspaceDir, path);

    try {
      await this.deps.fileSystem.stat(fullPath);
    } catch {
      return { success: false, output: '', error: `File not found: ${path}` };
    }

    try {
      await this.deps.fileSystem.deleteFile(fullPath);
      await this.deps.commitService.stage({ dir: workspaceDir, filepath: path });
      this.trackChange(workspaceDir, {
        path,
        type: 'delete',
        agentRole: input.agent_role as string | undefined,
        taskDescription: input.task_description as string | undefined,
      });
      return { success: true, output: `File deleted and staged: ${path}` };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Failed to delete file: ${error instanceof Error ? error.message : path}`,
      };
    }
  }

  /**
   * create_document: Generate a Word document from sections.
   */
  private async createDocument(input: Record<string, unknown>): Promise<ToolResult> {
    return this.generateDocument(input, 'docx');
  }

  /**
   * create_presentation: Generate a PowerPoint from slides.
   */
  private async createPresentation(input: Record<string, unknown>): Promise<ToolResult> {
    return this.generateDocument(input, 'pptx');
  }

  /**
   * create_spreadsheet: Generate an Excel spreadsheet from data.
   */
  private async createSpreadsheet(input: Record<string, unknown>): Promise<ToolResult> {
    return this.generateDocument(input, 'xlsx');
  }

  /**
   * create_pdf: Generate a PDF from content.
   */
  private async createPdf(input: Record<string, unknown>): Promise<ToolResult> {
    return this.generateDocument(input, 'pdf');
  }

  /**
   * Shared document generation handler.
   * Delegates to the injected DocumentEngine if available.
   */
  private async generateDocument(
    input: Record<string, unknown>,
    format: 'docx' | 'pptx' | 'xlsx' | 'pdf'
  ): Promise<ToolResult> {
    const engine = this.deps.documentEngine;
    if (!engine) {
      return {
        success: false,
        output: '',
        error: 'Document generation is not available (no DocumentEngine configured)',
      };
    }

    const title = input.title as string | undefined;
    if (!title) {
      const toolName =
        format === 'docx'
          ? 'document'
          : format === 'pptx'
            ? 'presentation'
            : format === 'xlsx'
              ? 'spreadsheet'
              : 'pdf';
      return {
        success: false,
        output: '',
        error: `create_${toolName} requires a "title" parameter`,
      };
    }

    try {
      const result = await engine.generate({
        title,
        author: input.author as string | undefined,
        format,
        sections: input.sections as
          | { heading?: string; content: string; level?: number }[]
          | undefined,
        slides: input.slides as { title: string; bullets?: string[]; notes?: string }[] | undefined,
        sheets: input.sheets as
          | { sheetName: string; headers: string[]; rows: (string | number)[][] }[]
          | undefined,
      });

      return {
        success: true,
        output: JSON.stringify({
          filename: result.filename,
          format: result.format,
          size: result.size,
          blobUrl: result.blobUrl,
          title,
        }),
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : `Failed to generate ${format}`,
      };
    }
  }

  /**
   * Track a staged change for a workspace directory.
   */
  private trackChange(workspaceDir: string, change: StagedChange): void {
    const existing = this.stagedChanges.get(workspaceDir) ?? [];
    existing.push(change);
    this.stagedChanges.set(workspaceDir, existing);
  }

  /**
   * Get all staged changes for a workspace directory.
   */
  getStagedChanges(workspaceDir: string): StagedChange[] {
    return this.stagedChanges.get(workspaceDir) ?? [];
  }

  /**
   * Commit all staged changes for a workspace. Called when a user approves.
   * Returns the commit SHA on success.
   */
  async commitStagedChanges(
    workspaceDir: string,
    author: { name: string; email: string }
  ): Promise<CommitResult> {
    const changes = this.stagedChanges.get(workspaceDir);
    if (!changes || changes.length === 0) {
      return { success: false, filesChanged: 0, error: 'No staged changes to commit' };
    }

    // Build a commit message from agent context
    const agentRoles = [...new Set(changes.map((c) => c.agentRole).filter(Boolean))];
    const tasks = [...new Set(changes.map((c) => c.taskDescription).filter(Boolean))];
    const fileList = changes.map((c) => `  ${c.type}: ${c.path}`).join('\n');

    const messageParts = ['Agent changes:'];
    if (agentRoles.length > 0) {
      messageParts.push(`Agents: ${agentRoles.join(', ')}`);
    }
    if (tasks.length > 0) {
      messageParts.push(`Tasks: ${tasks.join('; ')}`);
    }
    messageParts.push('', `Files (${changes.length}):`, fileList);

    const message = messageParts.join('\n');

    try {
      const result = await this.deps.commitService.commit({
        dir: workspaceDir,
        message,
        author,
      });

      if (!result.success) {
        return { success: false, filesChanged: 0, error: result.error ?? 'Commit failed' };
      }

      const filesChanged = changes.length;
      this.stagedChanges.delete(workspaceDir);
      return { success: true, sha: result.data, filesChanged };
    } catch (error) {
      return {
        success: false,
        filesChanged: 0,
        error: error instanceof Error ? error.message : 'Commit failed',
      };
    }
  }

  /**
   * Discard all staged changes for a workspace. Called when a user rejects.
   */
  async discardStagedChanges(workspaceDir: string): Promise<ToolResult> {
    const changes = this.stagedChanges.get(workspaceDir);
    if (!changes || changes.length === 0) {
      return { success: true, output: 'No staged changes to discard' };
    }

    const paths = changes.map((c) => c.path);

    try {
      await this.deps.commitService.unstage({ dir: workspaceDir, filepath: paths });
      this.stagedChanges.delete(workspaceDir);
      return { success: true, output: `Discarded ${changes.length} staged change(s)` };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Failed to discard changes',
      };
    }
  }

  /**
   * Resolve a relative path against the workspace directory.
   */
  private resolvePath(workspaceDir: string, relativePath: string): string {
    if (relativePath.startsWith('/')) return relativePath;
    if (relativePath === '.') return workspaceDir;
    const base = workspaceDir.endsWith('/') ? workspaceDir : `${workspaceDir}/`;
    return `${base}${relativePath}`;
  }

  /**
   * Recursively list directory entries.
   */
  private async listDir(dir: string, recursive: boolean): Promise<string[]> {
    const entries = await this.deps.fileSystem.readDir(dir);
    if (!recursive) return entries;

    const results: string[] = [];
    for (const entry of entries) {
      results.push(entry);
      const fullPath = this.resolvePath(dir, entry);
      try {
        const stat = await this.deps.fileSystem.stat(fullPath);
        if (stat.isDirectory) {
          const nested = await this.listDir(fullPath, true);
          for (const nestedEntry of nested) {
            results.push(`${entry}/${nestedEntry}`);
          }
        }
      } catch {
        // Skip entries that can't be stat'd
      }
    }
    return results;
  }

  /**
   * Simple glob-like matching (supports * and ** only).
   */
  private matchGlob(filePath: string, pattern: string): boolean {
    // Handle **/*.ext patterns
    if (pattern.startsWith('**/')) {
      const suffix = pattern.slice(3);
      return filePath.endsWith(suffix) || filePath.includes(`/${suffix}`);
    }
    // Handle *.ext patterns
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      return filePath.endsWith(ext);
    }
    return filePath.includes(pattern);
  }

  /**
   * Format diff output for agent consumption.
   */
  private formatDiffOutput(
    files: { path: string; type: string; additions: number; deletions: number; patch?: string }[],
    stats: { filesChanged: number; additions: number; deletions: number }
  ): string {
    if (files.length === 0) {
      return 'No changes found.';
    }

    const lines: string[] = [
      `${stats.filesChanged} file(s) changed, ${stats.additions} addition(s), ${stats.deletions} deletion(s)`,
      '',
    ];

    for (const file of files) {
      lines.push(`--- ${file.type}: ${file.path} (+${file.additions} -${file.deletions})`);
      if (file.patch) {
        lines.push(file.patch);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
