/**
 * Chat Input Component
 *
 * Input field for sending messages in a chat thread.
 * Supports text input with organic daube styling.
 * Includes a variant mode toggle for generating multiple AI responses.
 */

import type { MessageSender } from '@thumbcode/state';
import { useCallback, useState } from 'react';
import { Text } from '@/components/ui';
import { logger } from '@/lib/logger';
import { ChatService } from '@/services/chat';

/** Props for the ChatInput component */
interface ChatInputProps {
  /** ID of the chat thread to send messages to */
  threadId: string;
  /** Target agent to direct the message to */
  targetAgent?: MessageSender;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export function ChatInput({
  threadId,
  targetAgent,
  placeholder = 'Type a message...',
  disabled = false,
}: Readonly<ChatInputProps>) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [variantMode, setVariantMode] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    setIsSending(true);
    setText('');

    try {
      await ChatService.sendMessage({
        threadId,
        content: trimmedText,
        targetAgent,
        variantMode,
      });
    } catch (error) {
      logger.error('Failed to send message', error, { component: 'ChatInput' });
      // Restore text on error
      setText(trimmedText);
    } finally {
      setIsSending(false);
    }
  }, [text, threadId, targetAgent, isSending, variantMode]);

  const toggleVariantMode = useCallback(() => {
    setVariantMode((prev) => !prev);
  }, []);

  const canSend = text.trim().length > 0 && !disabled && !isSending;

  return (
    <div>
      {/* Variant mode suggestion row */}
      {variantMode && (
        <output
          className="block px-3 py-2 bg-surface border-t border-gold-400/30"
          aria-label="Variant mode active"
        >
          <Text className="font-body text-xs text-gold-400">
            Variants mode: your prompt will generate 3 alternative responses
          </Text>
        </output>
      )}
      <div
        className={`flex flex-row items-end p-3 border-t bg-surface ${variantMode ? 'border-gold-400' : 'border-neutral-700'}`}
      >
        <input
          aria-label="Message input"
          className="flex-1 bg-neutral-800 text-white font-body px-4 py-3 mr-2 rounded-organic-input"
          style={{ minHeight: 44, maxHeight: 120 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={variantMode ? 'Describe what you want variants for...' : placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={toggleVariantMode}
          className={`px-3 py-3 mr-2 rounded-organic-button ${variantMode ? 'bg-gold-400' : 'bg-neutral-700'}`}
          aria-label="Toggle variant mode"
          aria-pressed={variantMode}
        >
          <Text
            className={`font-mono text-xs font-semibold ${variantMode ? 'text-charcoal' : 'text-neutral-400'}`}
          >
            {'/V'}
          </Text>
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`px-4 py-3 rounded-organic-button ${canSend ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
          aria-label="Send"
          aria-description="Send the message"
        >
          <Text
            className={`font-body font-semibold ${canSend ? 'text-white' : 'text-neutral-500'}`}
          >
            {isSending ? '...' : 'Send'}
          </Text>
        </button>
      </div>
    </div>
  );
}
