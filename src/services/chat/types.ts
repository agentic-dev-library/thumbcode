/**
 * Chat Service Types
 *
 * Shared type definitions for the chat service modules.
 */

import type { MessageContentType, MessageSender } from '@/state';

export type ChatEventType =
  | 'message_start'
  | 'message_delta'
  | 'message_complete'
  | 'typing_start'
  | 'typing_end'
  | 'approval_request'
  | 'approval_response'
  | 'pipeline_started'
  | 'pipeline_stage_change'
  | 'pipeline_completed'
  | 'error';

export interface ChatEvent {
  type: ChatEventType;
  threadId: string;
  messageId?: string;
  delta?: string;
  sender?: MessageSender;
  error?: Error;
}

export interface SendMessageOptions {
  threadId: string;
  content: string;
  contentType?: MessageContentType;
  metadata?: Record<string, unknown>;
  targetAgent?: MessageSender;
  /** When true, generates multiple variant responses instead of a single response */
  variantMode?: boolean;
  /** Configuration for variant generation */
  variantOptions?: {
    variantCount?: number;
    diversityMode?: 'same_provider' | 'multi_provider';
  };
}

export interface StreamingResponse {
  messageId: string;
  content: string;
  isComplete: boolean;
}

export type ChatEventListener = (event: ChatEvent) => void;
