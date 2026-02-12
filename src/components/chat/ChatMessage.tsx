/**
 * Chat Message Component
 *
 * Renders individual chat messages with support for different content types.
 * Uses organic daube styling per brand guidelines.
 */

import type { ApprovalMessage, Message } from '@thumbcode/state';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { ApprovalCard } from './ApprovalCard';
import { CodeBlock } from './CodeBlock';

/** Props for the ChatMessage component */
interface ChatMessageProps {
  /** The message to render */
  message: Message;
  /** Called when the user responds to an approval request */
  onApprovalResponse?: (messageId: string, approved: boolean) => void;
}

/**
 * Get sender display name and color
 */
function getSenderInfo(sender: Message['sender']) {
  const senderMap: Record<Message['sender'], { name: string; bgColor: string; textColor: string }> =
    {
      user: { name: 'You', bgColor: 'bg-teal-600', textColor: 'text-white' },
      architect: { name: 'Architect', bgColor: 'bg-coral-500', textColor: 'text-white' },
      implementer: { name: 'Implementer', bgColor: 'bg-gold-500', textColor: 'text-charcoal' },
      reviewer: { name: 'Reviewer', bgColor: 'bg-teal-500', textColor: 'text-white' },
      tester: { name: 'Tester', bgColor: 'bg-neutral-600', textColor: 'text-white' },
      system: { name: 'System', bgColor: 'bg-neutral-700', textColor: 'text-neutral-300' },
    };
  return senderMap[sender] || senderMap.system;
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  // Render code message
  if (message.contentType === 'code') {
    return (
      <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="max-w-[90%]">
          <div className="flex-row items-center mb-1">
            <div className={`px-2 py-0.5 ${senderInfo.bgColor}`} style={organicBorderRadius.pill}>
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
          <div className="flex-row items-center mb-1">
            <div className={`px-2 py-0.5 ${senderInfo.bgColor}`} style={organicBorderRadius.pill}>
              <Text size="xs" className={senderInfo.textColor}>
                {senderInfo.name}
              </Text>
            </div>
          </div>
        )}
        <div
          className={`p-3 ${isUser ? 'bg-teal-600' : 'bg-surface-elevated'}`}
          style={isUser ? organicBorderRadius.chatBubbleUser : organicBorderRadius.chatBubbleAgent}
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
