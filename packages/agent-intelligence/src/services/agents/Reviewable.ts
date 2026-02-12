/**
 * Reviewable
 *
 * The agentic execution loop that iteratively processes tool calls.
 * Handles both standard and streaming execution modes.
 */

import type { TaskAssignment } from '@thumbcode/types';
import type { AIClient, CompletionOptions, Message, StreamEvent, ToolDefinition } from '../ai';
import { parseExecutionResult } from './Committable';
import { formatTaskMessage } from './Promptable';
import type { AgentContext, AgentExecutionResult } from './types';

export interface ExecutionConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  maxIterations?: number;
}

export interface ExecutionCallbacks {
  onStatusChange: (status: string) => void;
  onToolUse: (tool: string, input?: Record<string, unknown>, output?: string) => void;
  onThinking: (thought: string) => void;
  onError: (error: string) => void;
  onComplete: (result: AgentExecutionResult) => void;
  executeTool: (name: string, input: Record<string, unknown>, context: AgentContext) => Promise<string>;
}

/**
 * Execute a task with the iterative tool-use loop
 */
export async function executeTask(
  task: TaskAssignment,
  context: AgentContext,
  systemPrompt: string,
  tools: ToolDefinition[],
  aiClient: AIClient,
  config: ExecutionConfig,
  callbacks: ExecutionCallbacks
): Promise<AgentExecutionResult> {
  callbacks.onStatusChange('thinking');
  const conversationHistory: Message[] = [];

  const userMessage: Message = {
    role: 'user',
    content: formatTaskMessage(task, context),
  };
  conversationHistory.push(userMessage);

  let totalTokens = 0;

  try {
    let continueExecution = true;
    let iterations = 0;
    const maxIterations = config.maxIterations || 10;

    while (continueExecution && iterations < maxIterations) {
      iterations++;

      const options: CompletionOptions = {
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
      };

      const response = await aiClient.complete(conversationHistory, options);
      totalTokens += response.usage.totalTokens;

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
      };
      conversationHistory.push(assistantMessage);

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

      if (response.stopReason === 'tool_use' && toolUseBlocks.length > 0) {
        callbacks.onStatusChange('coding');

        const toolResults = await Promise.all(
          toolUseBlocks.map(async (block) => {
            callbacks.onToolUse(block.name || '', block.input);

            const output = await callbacks.executeTool(block.name || '', block.input || {}, context);

            callbacks.onToolUse(block.name || '', undefined, output);

            return {
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: output,
            };
          })
        );

        const toolResultMessage: Message = {
          role: 'user',
          content: toolResults,
        };
        conversationHistory.push(toolResultMessage);
      } else {
        continueExecution = false;
      }

      for (const block of response.content) {
        if (block.type === 'text' && block.text) {
          callbacks.onThinking(block.text);
        }
      }
    }

    callbacks.onStatusChange('idle');

    const output = parseExecutionResult(conversationHistory);

    const result: AgentExecutionResult = {
      success: true,
      output,
      messages: conversationHistory,
      tokensUsed: totalTokens,
    };

    callbacks.onComplete(result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    callbacks.onStatusChange('error');
    callbacks.onError(errorMessage);

    return {
      success: false,
      output: {
        filesCreated: [],
        filesModified: [],
        filesDeleted: [],
        summary: `Error: ${errorMessage}`,
      },
      messages: conversationHistory,
      tokensUsed: totalTokens,
      error: errorMessage,
    };
  }
}

/**
 * Execute a task with streaming support
 */
export async function executeTaskStream(
  task: TaskAssignment,
  context: AgentContext,
  systemPrompt: string,
  tools: ToolDefinition[],
  aiClient: AIClient,
  config: ExecutionConfig,
  callbacks: ExecutionCallbacks,
  onStream: (event: StreamEvent) => void
): Promise<AgentExecutionResult> {
  callbacks.onStatusChange('thinking');
  const conversationHistory: Message[] = [];

  const userMessage: Message = {
    role: 'user',
    content: formatTaskMessage(task, context),
  };
  conversationHistory.push(userMessage);

  let totalTokens = 0;

  try {
    let continueExecution = true;
    let iterations = 0;
    const maxIterations = config.maxIterations || 10;

    while (continueExecution && iterations < maxIterations) {
      iterations++;

      const options: CompletionOptions = {
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
        stream: true,
      };

      const response = await aiClient.completeStream(
        conversationHistory,
        options,
        onStream
      );
      totalTokens += response.usage.totalTokens;

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
      };
      conversationHistory.push(assistantMessage);

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

      if (response.stopReason === 'tool_use' && toolUseBlocks.length > 0) {
        callbacks.onStatusChange('coding');

        const toolResults = await Promise.all(
          toolUseBlocks.map(async (block) => {
            const output = await callbacks.executeTool(block.name || '', block.input || {}, context);
            return {
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: output,
            };
          })
        );

        const toolResultMessage: Message = {
          role: 'user',
          content: toolResults,
        };
        conversationHistory.push(toolResultMessage);
      } else {
        continueExecution = false;
      }
    }

    callbacks.onStatusChange('idle');
    const output = parseExecutionResult(conversationHistory);

    return {
      success: true,
      output,
      messages: conversationHistory,
      tokensUsed: totalTokens,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    callbacks.onStatusChange('error');

    return {
      success: false,
      output: {
        filesCreated: [],
        filesModified: [],
        filesDeleted: [],
        summary: `Error: ${errorMessage}`,
      },
      messages: conversationHistory,
      tokensUsed: totalTokens,
      error: errorMessage,
    };
  }
}
