/**
 * Chat Thread Component
 *
 * Displays a scrollable list of messages in a chat thread.
 * Includes typing indicators and auto-scroll to bottom.
 */

import { selectThreadMessages, selectTypingIndicators, useChatStore } from '@thumbcode/state';
import { useCallback, useEffect, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ChatService } from '@/services/chat';
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
    <View className="flex-row items-center px-4 py-2">
      <View className="flex-row mr-2">
        <View className="w-2 h-2 bg-neutral-400 rounded-full mr-1" />
        <View className="w-2 h-2 bg-neutral-500 rounded-full mr-1" />
        <View className="w-2 h-2 bg-neutral-600 rounded-full" />
      </View>
      <Text className="text-xs text-neutral-400 font-body italic">{label}...</Text>
    </View>
  );
}

export function ChatThread({ threadId }: ChatThreadProps) {
  const flatListRef = useRef<FlatList>(null);

  // Subscribe to messages and typing indicators
  const messages = useChatStore(selectThreadMessages(threadId));
  const typingSenders = useChatStore(selectTypingIndicators(threadId));

  // Handle approval responses
  const handleApprovalResponse = useCallback(
    (messageId: string, approved: boolean) => {
      ChatService.respondToApproval(threadId, messageId, approved);
    },
    [threadId]
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="font-display text-lg text-neutral-400 text-center mb-2">
          Start the conversation
        </Text>
        <Text className="font-body text-sm text-neutral-500 text-center">
          Send a message to begin collaborating with AI agents
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage message={item} onApprovalResponse={handleApprovalResponse} />
        )}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      <TypingIndicator senders={typingSenders} />
    </View>
  );
}
