/**
 * Architect Agent
 *
 * Specializes in system design, planning, and architecture decisions.
 */

import type { Agent, AgentCapability } from '@/types';
import type { ToolDefinition } from '../ai';
import { type AgentContext, BaseAgent } from './base-agent';

/**
 * Architect agent for system design and planning
 */
export class ArchitectAgent extends BaseAgent {
  protected getSystemPrompt(context: AgentContext): string {
    return `You are the Architect Agent for ThumbCode, a mobile-first code editor.

Your role is to:
1. Design system architecture and module structure
2. Break down features into implementable tasks
3. Define interfaces and data models
4. Create technical specifications
5. Make technology decisions

## Guidelines
- Always consider mobile-first constraints (battery, memory, offline)
- Follow React Native + Expo best practices
- Design for testability and maintainability
- Consider security implications for BYOK model
- Use TypeScript for type safety

## Current Context
- Working in: ${context.workspaceDir}
- Branch: ${context.currentBranch}
- Project: ${context.projectId}

## Available Tools
You have access to tools for reading files, creating specifications, and analyzing dependencies.

When creating architecture documents, use markdown format with clear sections for:
- Overview
- Components/Modules
- Data Flow
- Interfaces
- Dependencies
- Security Considerations
- Testing Strategy

Always provide actionable recommendations that other agents can implement.`;
  }

  protected getCapabilities(): Agent['capabilities'] {
    return [
      {
        id: 'system-design',
        name: 'System Design',
        description: 'Design system architecture and module structure',
        requiredCredentials: [],
        tools: ['read_file', 'analyze_dependencies', 'create_spec'],
      },
      {
        id: 'task-breakdown',
        name: 'Task Breakdown',
        description: 'Break down features into implementable tasks',
        requiredCredentials: [],
        tools: ['read_file', 'create_task'],
      },
      {
        id: 'interface-design',
        name: 'Interface Design',
        description: 'Define TypeScript interfaces and data models',
        requiredCredentials: [],
        tools: ['read_file', 'write_file'],
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
        name: 'analyze_dependencies',
        description: 'Analyze package dependencies and their relationships',
        input_schema: {
          type: 'object',
          properties: {
            scope: {
              type: 'string',
              description: 'Scope of analysis: "project", "package", or "file"',
              enum: ['project', 'package', 'file'],
            },
            target: {
              type: 'string',
              description: 'Target path for package or file scope',
            },
          },
          required: ['scope'],
        },
      },
      {
        name: 'create_spec',
        description: 'Create a technical specification document',
        input_schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the specification',
            },
            type: {
              type: 'string',
              description: 'Type of spec: "architecture", "interface", "feature"',
              enum: ['architecture', 'interface', 'feature'],
            },
            content: {
              type: 'string',
              description: 'Markdown content of the specification',
            },
            output_path: {
              type: 'string',
              description: 'Where to save the spec document',
            },
          },
          required: ['title', 'type', 'content', 'output_path'],
        },
      },
      {
        name: 'create_task',
        description: 'Create a task for another agent to implement',
        input_schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Detailed task description',
            },
            type: {
              type: 'string',
              description: 'Task type',
              enum: ['feature', 'bugfix', 'refactor', 'docs', 'test'],
            },
            assignee_role: {
              type: 'string',
              description: 'Role of agent to assign',
              enum: ['implementer', 'reviewer', 'tester'],
            },
            priority: {
              type: 'string',
              description: 'Task priority',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            acceptance_criteria: {
              type: 'array',
              description: 'List of acceptance criteria',
              items: { type: 'string', description: 'An acceptance criterion' },
            },
            depends_on: {
              type: 'array',
              description: 'Task IDs this task depends on',
              items: { type: 'string', description: 'A task ID dependency' },
            },
          },
          required: ['title', 'description', 'type', 'assignee_role', 'acceptance_criteria'],
        },
      },
    ];
  }

  /**
   * Agent-specific tool execution.
   * File I/O tools (read_file, list_directory, search_code) are handled
   * by ToolExecutionBridge in BaseAgent. This method handles only
   * architect-specific tools.
   */
  protected async executeTool(
    name: string,
    input: Record<string, unknown>,
    _context: AgentContext
  ): Promise<string> {
    switch (name) {
      case 'analyze_dependencies':
        return `[Dependency analysis for scope: ${input.scope}, target: ${input.target || 'all'}]`;

      case 'create_spec':
        return `Created specification: ${input.title}\nSaved to: ${input.output_path}`;

      case 'create_task':
        return `Created task: ${input.title}\nAssigned to: ${input.assignee_role}\nPriority: ${input.priority || 'medium'}`;

      default:
        return `Unknown tool: ${name}`;
    }
  }
}
