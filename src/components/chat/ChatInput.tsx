/**
 * Chat Input Component
 *
 * Input field for sending messages in a chat thread.
 * Supports text input with organic daube styling.
 * Includes a variant mode toggle for generating multiple AI responses.
 * Supports camera capture and voice input via Web APIs.
 */

import { useCallback, useState } from 'react';
import { Text } from '@/components/ui';
import { logger } from '@/lib/logger';
import { ChatService } from '@/services/chat';
import type { MediaAttachment, MessageSender } from '@/state';
import { CameraCapture } from './CameraCapture';
import { VoiceInputButton } from './VoiceInputButton';

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
  const [showCamera, setShowCamera] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if ((!trimmedText && attachments.length === 0) || isSending) return;

    setIsSending(true);
    setText('');
    const currentAttachments = [...attachments];
    setAttachments([]);

    try {
      await ChatService.sendMessage({
        threadId,
        content: trimmedText || '[Photo]',
        targetAgent,
        variantMode,
        metadata: currentAttachments.length > 0 ? { attachments: currentAttachments } : undefined,
      });
    } catch (error) {
      logger.error('Failed to send message', error, { component: 'ChatInput' });
      // Restore text and attachments on error
      setText(trimmedText);
      setAttachments(currentAttachments);
    } finally {
      setIsSending(false);
    }
  }, [text, threadId, targetAgent, isSending, variantMode, attachments]);

  const toggleVariantMode = useCallback(() => {
    setVariantMode((prev) => !prev);
  }, []);

  const handleCameraCapture = useCallback((attachment: MediaAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
    setShowCamera(false);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled && !isSending;

  return (
    <div className="safe-bottom">
      {/* Camera overlay */}
      {showCamera && (
        <div className="px-3 py-2 border-t border-neutral-700 bg-surface">
          <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
        </div>
      )}

      {/* Attachment preview row */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-3 py-2 border-t border-neutral-700 bg-surface">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative">
              <img
                src={attachment.uri}
                alt={attachment.filename ?? 'Attached photo'}
                className="w-16 h-16 object-cover rounded-organic-input"
              />
              <button
                type="button"
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-coral-500 rounded-full flex items-center justify-center"
                aria-label={`Remove ${attachment.filename ?? 'attachment'}`}
              >
                <Text className="text-white text-xs leading-none">x</Text>
              </button>
            </div>
          ))}
        </div>
      )}

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
        {/* Camera button */}
        <button
          type="button"
          onClick={() => setShowCamera((prev) => !prev)}
          className={`p-2.5 mr-1 rounded-organic-button ${showCamera ? 'bg-coral-500' : 'bg-neutral-700'}`}
          aria-label="Open camera"
          aria-pressed={showCamera}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={showCamera ? 'text-white' : 'text-neutral-400'}
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        {/* Voice input button */}
        <div className="mr-1">
          <VoiceInputButton onTranscript={handleVoiceTranscript} />
        </div>

        <input
          aria-label="Message input"
          className="flex-1 min-w-0 bg-neutral-800 text-white font-body px-3 py-3 mr-1 rounded-organic-input"
          style={{ minHeight: 44, maxHeight: 120 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={variantMode ? 'Describe what you want variants for...' : placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={toggleVariantMode}
          className={`p-2.5 mr-1 rounded-organic-button ${variantMode ? 'bg-gold-400' : 'bg-neutral-700'}`}
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
          className={`px-3 py-2.5 rounded-organic-button ${canSend ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
          aria-label="Send"
          title="Send the message"
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
