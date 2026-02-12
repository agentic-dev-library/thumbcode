/**
 * Committable
 *
 * Result parsing and output generation from agent conversation history.
 * Extracts file operations and summaries from tool results.
 */

import type { TaskOutput } from '@thumbcode/types';
import type { Message } from '../ai';

/**
 * Parse execution results from conversation history to determine
 * what files were created, modified, or deleted.
 */
export function parseExecutionResult(conversationHistory: Message[]): TaskOutput {
  const filesCreated: string[] = [];
  const filesModified: string[] = [];
  const filesDeleted: string[] = [];

  // Look through tool results for file operations
  for (const message of conversationHistory) {
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'tool_result' && block.content) {
          if (block.content.includes('Created file:')) {
            const match = block.content.match(/Created file: (.+)/);
            if (match) filesCreated.push(match[1]);
          }
          if (block.content.includes('Modified file:')) {
            const match = block.content.match(/Modified file: (.+)/);
            if (match) filesModified.push(match[1]);
          }
          if (block.content.includes('Deleted file:')) {
            const match = block.content.match(/Deleted file: (.+)/);
            if (match) filesDeleted.push(match[1]);
          }
        }
      }
    }
  }

  // Get final summary from last assistant message
  let summary = 'Task completed';
  const lastAssistantMessage = [...conversationHistory]
    .reverse()
    .find((m) => m.role === 'assistant');
  if (lastAssistantMessage && typeof lastAssistantMessage.content === 'string') {
    summary = lastAssistantMessage.content.slice(0, 500);
  } else if (lastAssistantMessage && Array.isArray(lastAssistantMessage.content)) {
    const textBlock = lastAssistantMessage.content.find((b) => b.type === 'text');
    if (textBlock?.text) {
      summary = textBlock.text.slice(0, 500);
    }
  }

  return {
    filesCreated,
    filesModified,
    filesDeleted,
    summary,
  };
}
