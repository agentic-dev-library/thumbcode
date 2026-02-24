/**
 * Message Store
 *
 * Handles thread CRUD, message queries, and search operations.
 * Delegates to the Zustand chat store for persistence.
 */

import type { ChatThread, Message, MessageSender } from '@/state';
import { useChatStore } from '@/state';
import type { StreamHandler } from './StreamHandler';
import type { SendMessageOptions } from './types';

export class MessageStore {
  constructor(private streamHandler: StreamHandler) {}

  /**
   * Create a new chat thread
   */
  createThread(options: {
    title: string;
    projectId?: string;
    participants?: MessageSender[];
  }): string {
    const { title, projectId, participants = ['user'] } = options;

    return useChatStore.getState().createThread({
      title,
      projectId,
      participants,
      isPinned: false,
    });
  }

  /**
   * Get all threads
   */
  getThreads(): ChatThread[] {
    return useChatStore.getState().threads;
  }

  /**
   * Get a specific thread
   */
  getThread(threadId: string): ChatThread | undefined {
    return useChatStore.getState().threads.find((t) => t.id === threadId);
  }

  /**
   * Get messages for a thread
   */
  getMessages(threadId: string): Message[] {
    return useChatStore.getState().messages[threadId] || [];
  }

  /**
   * Send a message in a thread
   */
  sendUserMessage(options: SendMessageOptions): string {
    const { threadId, content, contentType = 'text', metadata } = options;

    const messageId = useChatStore.getState().addMessage({
      threadId,
      sender: 'user',
      content,
      contentType,
      metadata,
    });

    this.streamHandler.emit({
      type: 'message_complete',
      threadId,
      messageId,
      sender: 'user',
    });

    return messageId;
  }

  /**
   * Send a code message
   */
  sendCodeMessage(options: {
    threadId: string;
    code: string;
    language: string;
    filename?: string;
  }): string {
    const { threadId, code, language, filename } = options;

    const messageId = useChatStore.getState().addMessage({
      threadId,
      sender: 'user',
      content: code,
      contentType: 'code',
      metadata: {
        language,
        filename,
      },
    });

    this.streamHandler.emit({
      type: 'message_complete',
      threadId,
      messageId,
      sender: 'user',
    });

    return messageId;
  }

  /**
   * Delete a thread
   */
  deleteThread(threadId: string): void {
    this.streamHandler.cancelResponse(threadId);
    useChatStore.getState().deleteThread(threadId);
  }

  /**
   * Clear all messages in a thread
   */
  clearThread(threadId: string): void {
    useChatStore.getState().clearThread(threadId);
  }

  /**
   * Pin/unpin a thread
   */
  pinThread(threadId: string, pinned: boolean): void {
    useChatStore.getState().pinThread(threadId, pinned);
  }

  /**
   * Mark a thread as read
   */
  markAsRead(threadId: string): void {
    useChatStore.getState().markThreadAsRead(threadId);
  }

  /**
   * Search messages across threads
   */
  searchMessages(query: string): Message[] {
    const allMessages = useChatStore.getState().messages;
    const results: Message[] = [];
    const queryLower = query.toLowerCase();

    for (const threadMessages of Object.values(allMessages)) {
      for (const message of threadMessages) {
        if (message.content.toLowerCase().includes(queryLower)) {
          results.push(message);
        }
      }
    }

    return results.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
