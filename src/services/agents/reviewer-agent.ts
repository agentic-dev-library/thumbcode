/**
 * Reviewer Agent
 *
 * Specializes in code review and quality assurance.
 */

import type { Agent, AgentCapability } from '@/types';
import type { ToolDefinition } from '../ai';
import { type AgentContext, BaseAgent } from './base-agent';

/**
 * Reviewer agent for code review
 */
export class ReviewerAgent extends BaseAgent {
  protected getSystemPrompt(context: AgentContext): string {
    return `You are the Reviewer Agent for ThumbCode, a mobile-first code editor.

Your role is to:
1. Review code for quality, security, and best practices
2. Identify bugs, vulnerabilities, and performance issues
3. Ensure code follows project conventions
4. Verify proper error handling
5. Check TypeScript types and interfaces
6. Validate accessibility (a11y) compliance

## Review Checklist
- [ ] TypeScript types are properly defined
- [ ] No any types without justification
- [ ] Error handling is comprehensive
- [ ] Security: no hardcoded secrets, proper input validation
- [ ] Performance: no obvious bottlenecks, proper memoization
- [ ] Accessibility: proper labels, focus management
- [ ] Code style: follows project conventions
- [ ] Tests: adequate coverage, meaningful assertions
- [ ] Documentation: clear comments for complex logic

## ThumbCode Standards
- Uses P3 "Warm Technical" design system
- NativeWind for styling
- Zustand for state management
- expo-secure-store for credentials
- NEVER gradients, ALWAYS organic shapes

## Current Context
- Working in: ${context.workspaceDir}
- Branch: ${context.currentBranch}
- Project: ${context.projectId}

## Available Tools
You have access to tools for reading files, viewing diffs, and creating review comments.

When reviewing:
1. Read the relevant files
2. Identify issues by severity (critical, major, minor, suggestion)
3. Provide specific, actionable feedback
4. Suggest improvements with code examples when helpful`;
  }

  protected getCapabilities(): Agent['capabilities'] {
    return [
      {
        id: 'code-review',
        name: 'Code Review',
        description: 'Review code for quality and best practices',
        requiredCredentials: [],
        tools: ['read_file', 'get_diff', 'add_comment'],
      },
      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Identify security vulnerabilities',
        requiredCredentials: [],
        tools: ['read_file', 'search_code', 'add_comment'],
      },
      {
        id: 'a11y-review',
        name: 'Accessibility Review',
        description: 'Check accessibility compliance',
        requiredCredentials: [],
        tools: ['read_file', 'add_comment'],
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
        name: 'get_diff',
        description: 'Get the diff for changed files',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Specific file path, or empty for all changes',
            },
            base_ref: {
              type: 'string',
              description: 'Base reference (commit/branch) to diff against',
            },
          },
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
        name: 'add_comment',
        description: 'Add a review comment to a file',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path for the comment',
            },
            line: {
              type: 'number',
              description: 'Line number for inline comment (optional)',
            },
            severity: {
              type: 'string',
              description: 'Severity level',
              enum: ['critical', 'major', 'minor', 'suggestion'],
            },
            category: {
              type: 'string',
              description: 'Category of the issue',
              enum: ['bug', 'security', 'performance', 'style', 'a11y', 'type', 'other'],
            },
            message: {
              type: 'string',
              description: 'Review comment message',
            },
            suggestion: {
              type: 'string',
              description: 'Suggested fix (code snippet)',
            },
          },
          required: ['path', 'severity', 'category', 'message'],
        },
      },
      {
        name: 'approve_changes',
        description: 'Approve the changes after review',
        input_schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Summary of the review',
            },
            conditions: {
              type: 'array',
              description: 'Any conditions for approval',
              items: { type: 'string', description: 'A condition for approval' },
            },
          },
          required: ['summary'],
        },
      },
      {
        name: 'request_changes',
        description: 'Request changes before approval',
        input_schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Summary of required changes',
            },
            blocking_issues: {
              type: 'array',
              description: 'List of issues that must be fixed',
              items: { type: 'string', description: 'A blocking issue' },
            },
          },
          required: ['summary', 'blocking_issues'],
        },
      },
    ];
  }

  /**
   * Agent-specific tool execution.
   * File I/O tools (read_file, list_directory, get_diff, search_code) are
   * handled by ToolExecutionBridge in BaseAgent. This method handles only
   * reviewer-specific tools.
   */
  protected async executeTool(
    name: string,
    input: Record<string, unknown>,
    _context: AgentContext
  ): Promise<string> {
    switch (name) {
      case 'add_comment': {
        const location = input.line ? `:${input.line}` : '';
        return `Added ${input.severity} comment on ${input.path}${location}: ${input.message}`;
      }

      case 'approve_changes':
        return `Approved changes: ${input.summary}`;

      case 'request_changes':
        return `Requested changes: ${input.summary}\nBlocking issues: ${(input.blocking_issues as string[])?.join(', ')}`;

      default:
        return `Unknown tool: ${name}`;
    }
  }
}
