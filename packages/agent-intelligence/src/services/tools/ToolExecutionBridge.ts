/**
 * Tool Execution Bridge
 *
 * Connects agent tool definitions to actual git service implementations.
 * Each tool name maps to a specific git service method. The bridge accepts
 * injectable dependencies so it can be tested without real git operations.
 *
 * Handles: read_file, list_directory, get_diff, search_code, run_tests,
 * get_coverage, analyze_test_results, and other read-oriented tools.
 */

import type { ToolBridgeDependencies, ToolResult } from './types';

export class ToolExecutionBridge {
  private deps: ToolBridgeDependencies;

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
