/**
 * Chat Message Component
 *
 * Renders individual chat messages with support for different content types.
 * Uses organic daube styling per brand guidelines.
 */

import { memo } from 'react';
import { Text } from '@/components/ui';
import { formatTime, getSenderInfo } from '@/lib/chat-utils';
import type {
  ApprovalMessage,
  DocumentOutputMessage,
  ImageMessage as ImageMessageType,
  Message,
  VoiceMessage,
} from '@/state';
import { ApprovalCard } from './ApprovalCard';
import { AudioMessage } from './AudioMessage';
import { CodeBlock } from './CodeBlock';
import { DocumentCard } from './DocumentCard';
import { ImageMessage } from './ImageMessage';
import { MixedMediaMessage } from './MixedMediaMessage';

/** Props for the ChatMessage component */
interface ChatMessageProps {
  /** The message to render */
  message: Message;
  /** Called when the user responds to an approval request */
  onApprovalResponse?: (messageId: string, approved: boolean) => void;
}

/** Wrapper for media-type messages (approval, document, image, voice, mixed) */
function MessageWrapper({ message, children }: { message: Message; children: React.ReactNode }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {children}
      <Text className="text-xs text-neutral-500 mt-1 mx-2">{formatTime(message.timestamp)}</Text>
    </div>
  );
}

/** Renders the appropriate content based on message type */
function renderSpecialContent(
  message: Message,
  onApprovalResponse?: (messageId: string, approved: boolean) => void
): React.ReactNode | null {
  if (message.contentType === 'approval_request') {
    const approvalMessage = message as ApprovalMessage;
    return (
      <MessageWrapper message={message}>
        <ApprovalCard
          message={approvalMessage}
          onApprove={() => onApprovalResponse?.(message.id, true)}
          onReject={() => onApprovalResponse?.(message.id, false)}
        />
      </MessageWrapper>
    );
  }
  if (message.contentType === 'document_output') {
    return (
      <MessageWrapper message={message}>
        <DocumentCard message={message as DocumentOutputMessage} />
      </MessageWrapper>
    );
  }
  if (message.contentType === 'image') {
    return (
      <MessageWrapper message={message}>
        <ImageMessage message={message as ImageMessageType} />
      </MessageWrapper>
    );
  }
  if (message.contentType === 'voice_transcript') {
    return (
      <MessageWrapper message={message}>
        <AudioMessage message={message as VoiceMessage} />
      </MessageWrapper>
    );
  }
  if (message.contentType === 'mixed_media') {
    return (
      <MessageWrapper message={message}>
        <MixedMediaMessage message={message} />
      </MessageWrapper>
    );
  }
  return null;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  onApprovalResponse,
}: Readonly<ChatMessageProps>) {
  const isUser = message.sender === 'user';
  const senderInfo = getSenderInfo(message.sender);

  // Render special content types
  const specialContent = renderSpecialContent(message, onApprovalResponse);
  if (specialContent) return specialContent;

  // Render code message
  if (message.contentType === 'code') {
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="max-w-[90%]">
          <div className="flex flex-row items-center mb-1">
            <div className={`px-2 py-0.5 ${senderInfo.bgColor} rounded-organic-input`}>
              <Text size="xs" className={senderInfo.textColor}>
                {senderInfo.name}
              </Text>
            </div>
          </div>
          <CodeBlock
            code={message.content}
            language={(message.metadata?.language as string) || 'text'}
            filename={message.metadata?.filename as string | undefined}
          />
          <Text className="text-xs text-neutral-500 mt-1">{formatTime(message.timestamp)}</Text>
        </div>
      </div>
    );
  }

  // Render text message
  return (
    <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="max-w-[80%]">
        {!isUser && (
          <div className="flex flex-row items-center mb-1">
            <div className={`px-2 py-0.5 ${senderInfo.bgColor} rounded-organic-input`}>
              <Text size="xs" className={senderInfo.textColor}>
                {senderInfo.name}
              </Text>
            </div>
          </div>
        )}
        <div
          className={`p-3 ${isUser ? 'bg-teal-600 rounded-organic-chat-user' : 'bg-surface-elevated rounded-organic-chat-agent'}`}
        >
          <Text className={isUser ? 'text-white' : 'text-neutral-200'}>{message.content}</Text>
        </div>
        <div className={`flex-row items-center mt-1 ${isUser ? 'justify-end' : ''}`}>
          <Text className="text-xs text-neutral-500">{formatTime(message.timestamp)}</Text>
          {message.status === 'sending' && (
            <Text className="text-xs text-neutral-500 ml-1">• Sending...</Text>
          )}
          {message.status === 'failed' && (
            <Text className="text-xs text-coral-400 ml-1">• Failed</Text>
          )}
        </div>
      </div>
    </div>
  );
});
