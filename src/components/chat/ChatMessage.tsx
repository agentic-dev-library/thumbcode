/**
 * Chat Message Component
 *
 * Renders individual chat messages with support for different content types.
 * Uses organic daube styling per brand guidelines.
 */

import type {
  ApprovalMessage,
  DocumentOutputMessage,
  ImageMessage as ImageMessageType,
  Message,
  VoiceMessage,
} from '@thumbcode/state';
import { Text } from '@/components/ui';
import { formatTime, getSenderInfo } from '@/lib/chat-utils';
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

export function ChatMessage({ message, onApprovalResponse }: Readonly<ChatMessageProps>) {
  const isUser = message.sender === 'user';
  const senderInfo = getSenderInfo(message.sender);

  // Render approval request
  if (message.contentType === 'approval_request') {
    const approvalMessage = message as ApprovalMessage;
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <ApprovalCard
          message={approvalMessage}
          onApprove={() => onApprovalResponse?.(message.id, true)}
          onReject={() => onApprovalResponse?.(message.id, false)}
        />
        <Text className="text-xs text-neutral-500 mt-1 mx-2">{formatTime(message.timestamp)}</Text>
      </div>
    );
  }

  // Render document output
  if (message.contentType === 'document_output') {
    const docMessage = message as DocumentOutputMessage;
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <DocumentCard message={docMessage} />
        <Text className="text-xs text-neutral-500 mt-1 mx-2">{formatTime(message.timestamp)}</Text>
      </div>
    );
  }

  // Render image message
  if (message.contentType === 'image') {
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <ImageMessage message={message as ImageMessageType} />
        <Text className="text-xs text-neutral-500 mt-1 mx-2">{formatTime(message.timestamp)}</Text>
      </div>
    );
  }

  // Render voice transcript / audio message
  if (message.contentType === 'voice_transcript') {
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <AudioMessage message={message as VoiceMessage} />
        <Text className="text-xs text-neutral-500 mt-1 mx-2">{formatTime(message.timestamp)}</Text>
      </div>
    );
  }

  // Render mixed media message
  if (message.contentType === 'mixed_media') {
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <MixedMediaMessage message={message} />
        <Text className="text-xs text-neutral-500 mt-1 mx-2">{formatTime(message.timestamp)}</Text>
      </div>
    );
  }

  // Render code message
  if (message.contentType === 'code') {
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="max-w-[90%]">
          <div className="flex flex-rowitems-center mb-1">
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
          <div className="flex flex-rowitems-center mb-1">
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
}
