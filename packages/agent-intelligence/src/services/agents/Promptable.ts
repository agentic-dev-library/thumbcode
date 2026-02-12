/**
 * Promptable
 *
 * Task formatting and prompt construction for agent execution.
 * Converts TaskAssignment and AgentContext into structured prompts.
 */

import type { TaskAssignment } from '@thumbcode/types';
import type { AgentContext } from './types';

/**
 * Format a task assignment into a structured prompt message
 */
export function formatTaskMessage(task: TaskAssignment, context: AgentContext): string {
  return `
# Task: ${task.title}

## Description
${task.description}

## Acceptance Criteria
${task.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}

## Context
- Project: ${context.projectId}
- Branch: ${context.currentBranch}
- Workspace: ${context.workspaceDir}

## Available Files
${context.availableFiles.slice(0, 50).join('\n')}
${context.availableFiles.length > 50 ? `\n... and ${context.availableFiles.length - 50} more files` : ''}

## References
${task.references.length > 0 ? task.references.join('\n') : 'None'}

Please complete this task step by step.
`.trim();
}
