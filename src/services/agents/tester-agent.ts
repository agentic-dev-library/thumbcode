/**
 * Tester Agent
 *
 * Specializes in writing and running tests.
 */

import type { Agent, AgentCapability } from '@/types';
import type { ToolDefinition } from '../ai';
import { type AgentContext, BaseAgent } from './base-agent';

/**
 * Tester agent for test generation and execution
 */
export class TesterAgent extends BaseAgent {
  protected getSystemPrompt(context: AgentContext): string {
    return `You are the Tester Agent for ThumbCode, a mobile-first code editor.

Your role is to:
1. Write unit tests using Jest
2. Write integration tests using React Native Testing Library
3. Generate test cases from requirements
4. Run tests and report results
5. Measure and improve code coverage

## Testing Standards
- Use Jest as the test runner
- Use @testing-library/react-native for component tests
- Follow AAA pattern (Arrange, Act, Assert)
- Write meaningful test descriptions
- Test both happy paths and edge cases
- Mock external dependencies appropriately

## Test File Conventions
- Place tests in __tests__ directories or alongside source files
- Name test files with .test.ts or .test.tsx suffix
- Group related tests with describe blocks
- Use meaningful test names that describe behavior

## Coverage Targets
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Current Context
- Working in: ${context.workspaceDir}
- Branch: ${context.currentBranch}
- Project: ${context.projectId}

## Available Tools
You have access to tools for reading files, writing tests, and running test commands.

When writing tests:
1. Read the source file to understand what to test
2. Identify all code paths and edge cases
3. Write tests that are isolated and deterministic
4. Include both positive and negative test cases
5. Add appropriate mocks for external dependencies`;
  }

  protected getCapabilities(): Agent['capabilities'] {
    return [
      {
        id: 'unit-testing',
        name: 'Unit Testing',
        description: 'Write unit tests with Jest',
        requiredCredentials: [],
        tools: ['read_file', 'write_file', 'run_tests'],
      },
      {
        id: 'integration-testing',
        name: 'Integration Testing',
        description: 'Write integration tests',
        requiredCredentials: [],
        tools: ['read_file', 'write_file', 'run_tests'],
      },
      {
        id: 'coverage-analysis',
        name: 'Coverage Analysis',
        description: 'Analyze and improve test coverage',
        requiredCredentials: [],
        tools: ['run_tests', 'get_coverage'],
      },
    ] satisfies AgentCapability[];
  }

  protected getTools(): ToolDefinition[] {
    return [
      {
        name: 'read_file',
        description: 'Read the contents of a file in the workspace',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to the file from workspace root',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Write content to a file, creating it if it does not exist',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to the file',
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_directory',
        description: 'List files and directories in a path',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to the directory',
            },
            recursive: {
              type: 'boolean',
              description: 'Whether to list recursively',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'search_code',
        description: 'Search for code patterns in the workspace',
        input_schema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Search pattern (regex supported)',
            },
            file_pattern: {
              type: 'string',
              description: 'Glob pattern for files to search',
            },
          },
          required: ['pattern'],
        },
      },
      {
        name: 'run_tests',
        description: 'Run tests using Jest',
        input_schema: {
          type: 'object',
          properties: {
            test_pattern: {
              type: 'string',
              description: 'Pattern to match test files',
            },
            watch: {
              type: 'boolean',
              description: 'Run in watch mode',
            },
            coverage: {
              type: 'boolean',
              description: 'Collect coverage information',
            },
            update_snapshots: {
              type: 'boolean',
              description: 'Update snapshots',
            },
          },
        },
      },
      {
        name: 'get_coverage',
        description: 'Get current test coverage report',
        input_schema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              description: 'Coverage report format',
              enum: ['text', 'html', 'json'],
            },
            threshold_check: {
              type: 'boolean',
              description: 'Check against coverage thresholds',
            },
          },
        },
      },
      {
        name: 'create_mock',
        description: 'Create a mock for a module or dependency',
        input_schema: {
          type: 'object',
          properties: {
            module_path: {
              type: 'string',
              description: 'Path to the module to mock',
            },
            mock_implementation: {
              type: 'string',
              description: 'Mock implementation code',
            },
            output_path: {
              type: 'string',
              description: 'Where to save the mock file',
            },
          },
          required: ['module_path', 'mock_implementation'],
        },
      },
      {
        name: 'analyze_test_results',
        description: 'Analyze test results and identify issues',
        input_schema: {
          type: 'object',
          properties: {
            results_path: {
              type: 'string',
              description: 'Path to test results JSON',
            },
          },
        },
      },
    ];
  }

  /**
   * Agent-specific tool execution.
   * File I/O tools (read_file, write_file, list_directory, search_code,
   * run_tests, get_coverage, analyze_test_results) are handled by
   * ToolExecutionBridge in BaseAgent. This method handles only
   * tester-specific tools.
   */
  protected async executeTool(
    name: string,
    input: Record<string, unknown>,
    _context: AgentContext
  ): Promise<string> {
    switch (name) {
      case 'create_mock':
        return `Created mock for ${input.module_path}${input.output_path ? ` at ${input.output_path}` : ''}`;

      default:
        return `Unknown tool: ${name}`;
    }
  }
}
