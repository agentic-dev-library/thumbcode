/**
 * Chat Thread Component
 *
 * Displays a scrollable list of messages in a chat thread.
 * Includes typing indicators and auto-scroll to bottom.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Text } from '@/components/ui';
import { ChatService } from '@/services/chat';
import { selectThreadMessages, selectTypingIndicators, useChatStore } from '@/state';
import { ChatMessage } from './ChatMessage';

/** Props for the ChatThread component */
interface ChatThreadProps {
  /** ID of the thread to display */
  threadId: string;
}

/**
 * Typing indicator dot animation placeholder
 */
function TypingIndicator({ senders }: { senders: string[] }) {
  if (senders.length === 0) return null;

  const names = senders.map((s) => {
    const nameMap: Record<string, string> = {
      architect: 'Architect',
      implementer: 'Implementer',
      reviewer: 'Reviewer',
      tester: 'Tester',
    };
    return nameMap[s] || s;
  });

  const label = names.length === 1 ? `${names[0]} is typing` : `${names.join(', ')} are typing`;

  return (
    <div className="flex flex-row items-center px-4 py-2">
      <div className="flex flex-row mr-2">
        <div className="w-2 h-2 bg-neutral-400 rounded-full mr-1" />
        <div className="w-2 h-2 bg-neutral-500 rounded-full mr-1" />
        <div className="w-2 h-2 bg-neutral-600 rounded-full" />
      </div>
      <Text className="text-xs text-neutral-400 font-body italic">{label}...</Text>
    </div>
  );
}

export function ChatThread({ threadId }: Readonly<ChatThreadProps>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages and typing indicators
  const messages = useChatStore(useShallow(selectThreadMessages(threadId)));
  const typingSenders = useChatStore(useShallow(selectTypingIndicators(threadId)));

  // Handle approval responses
  const handleApprovalResponse = useCallback(
    (messageId: string, approved: boolean) => {
      ChatService.respondToApproval(threadId, messageId, approved);
    },
    [threadId]
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Text className="font-display text-lg text-neutral-400 text-center mb-2">
          Start the conversation
        </Text>
        <Text className="font-body text-sm text-neutral-500 text-center">
          Send a message to begin collaborating with AI agents
        </Text>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div ref={scrollRef} className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
        {messages.map((item) => (
          <ChatMessage key={item.id} message={item} onApprovalResponse={handleApprovalResponse} />
        ))}
      </div>
      <TypingIndicator senders={typingSenders} />
    </div>
  );
}
