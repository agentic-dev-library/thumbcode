/**
 * Stream Handler
 *
 * Manages event system, abort controllers, and streaming infrastructure
 * for the chat service.
 */

import type { MessageSender } from '@thumbcode/state';
import type { ChatEvent, ChatEventListener } from './types';

export class StreamHandler {
  private listeners: Set<ChatEventListener> = new Set();
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * Subscribe to chat events
   */
  onEvent(listener: ChatEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit an event to all listeners
   */
  emit(event: ChatEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[ChatService] Error in event listener:', error);
      }
    }
  }

  /**
   * Register an abort controller for a thread
   */
  registerAbort(threadId: string): AbortController {
    const controller = new AbortController();
    this.abortControllers.set(threadId, controller);
    return controller;
  }

  /**
   * Cancel an ongoing response
   */
  cancelResponse(threadId: string): void {
    const controller = this.abortControllers.get(threadId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(threadId);
    }
  }

  /**
   * Clean up an abort controller after completion
   */
  cleanupAbort(threadId: string): void {
    this.abortControllers.delete(threadId);
  }

  /**
   * Emit typing start event
   */
  emitTypingStart(threadId: string, sender: MessageSender): void {
    this.emit({ type: 'typing_start', threadId, sender });
  }

  /**
   * Emit typing end event
   */
  emitTypingEnd(threadId: string, sender: MessageSender): void {
    this.emit({ type: 'typing_end', threadId, sender });
  }

  /**
   * Helper to delay with abort support
   */
  delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });
  }
}
