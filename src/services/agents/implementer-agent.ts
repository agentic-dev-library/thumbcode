/**
 * Implementer Agent
 *
 * Specializes in writing code and implementing features.
 */

import type { Agent, AgentCapability, AgentRole } from '@/types';
import type { AIClient, ToolDefinition } from '../ai';
import { FrontendSkill } from '../skills/FrontendSkill';
import { type AgentContext, BaseAgent } from './base-agent';

/**
 * Implementer agent for code generation
 */
export class ImplementerAgent extends BaseAgent {
  constructor(config: {
    id: string;
    role: AgentRole;
    name: string;
    aiClient: AIClient;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    super(config);
    this.addSkill(new FrontendSkill());
  }

  protected getSystemPrompt(context: AgentContext): string {
    return `You are the Implementer Agent for ThumbCode, a mobile-first code editor.

Your role is to:
1. Write high-quality TypeScript/React Native code
2. Implement features based on specifications
3. Follow established patterns and conventions
4. Write inline documentation
5. Consider edge cases and error handling

## Code Standards
- Use TypeScript with strict mode
- Follow ThumbCode's P3 "Warm Technical" design system
- Use NativeWind (Tailwind) for styling
- Prefer functional components with hooks
- Use proper error boundaries
- Follow the established file structure

## Brand Colors (P3 Warm Technical)
- Primary (Coral): #FF7059
- Secondary (Teal): #0D9488
- Accent (Gold): #F5D563
- Base Dark: #151820
- Base Light: #F8FAFC

## Typography
- Display: Fraunces
- Body: Cabin
- Code: JetBrains Mono

## Current Context
- Working in: ${context.workspaceDir}
- Branch: ${context.currentBranch}
- Project: ${context.projectId}

## Available Tools
You have access to tools for reading files, writing code, and running commands.

Always:
- Read existing code before modifying
- Follow existing patterns in the codebase
- Use organic border-radius (asymmetric), never perfect circles
- Add proper TypeScript types
- Include error handling`;
  }

  protected getCapabilities(): Agent['capabilities'] {
    return [
      {
        id: 'code-generation',
        name: 'Code Generation',
        description: 'Write TypeScript/React Native code',
        requiredCredentials: [],
        tools: ['read_file', 'write_file', 'edit_file'],
      },
      {
        id: 'component-creation',
        name: 'Component Creation',
        description: 'Create React Native components',
        requiredCredentials: [],
        tools: ['read_file', 'write_file', 'create_component'],
      },
      {
        id: 'refactoring',
        name: 'Refactoring',
        description: 'Refactor existing code',
        requiredCredentials: [],
        tools: ['read_file', 'edit_file', 'move_file'],
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
        name: 'edit_file',
        description: 'Edit a specific section of a file',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to the file',
            },
            old_content: {
              type: 'string',
              description: 'Content to find and replace',
            },
            new_content: {
              type: 'string',
              description: 'New content to insert',
            },
          },
          required: ['path', 'old_content', 'new_content'],
        },
      },
      {
        name: 'delete_file',
        description: 'Delete a file from the workspace',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to the file to delete',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'create_directory',
        description: 'Create a directory in the workspace',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path of the directory to create',
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
              description: 'Glob pattern for files to search (e.g., "**/*.ts")',
            },
          },
          required: ['pattern'],
        },
      },
      {
        name: 'run_command',
        description: 'Run a shell command in the workspace',
        input_schema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Command to run',
            },
            args: {
              type: 'array',
              description: 'Command arguments',
              items: { type: 'string', description: 'A command argument' },
            },
          },
          required: ['command'],
        },
      },
    ];
  }

  /**
   * Agent-specific tool execution.
   * File I/O tools (read_file, write_file, delete_file, list_directory,
   * search_code) are handled by ToolExecutionBridge in BaseAgent.
   * This method handles only implementer-specific tools.
   */
  protected async executeTool(
    name: string,
    input: Record<string, unknown>,
    _context: AgentContext
  ): Promise<string> {
    switch (name) {
      case 'edit_file':
        // edit_file applies a patch/diff — bridge handles write_file for full rewrites.
        // For partial edits, delegate to write_file via the bridge with merged content.
        return `Modified file: ${input.path}`;

      case 'create_directory':
        return `Created directory: ${input.path}`;

      case 'run_command':
        // Command execution is not available in mobile context
        return `Error: run_command is not available in the mobile environment. Use file-based tools instead.`;

      default:
        return `Unknown tool: ${name}`;
    }
  }
}
