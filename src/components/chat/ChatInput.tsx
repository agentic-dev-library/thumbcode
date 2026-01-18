/**
 * Chat Input Component
 *
 * Input field for sending messages in a chat thread.
 * Supports text input with organic daube styling.
 */

import type { MessageSender } from '@thumbcode/state';
import { useCallback, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChatService } from '@/services/chat';

interface ChatInputProps {
  threadId: string;
  targetAgent?: MessageSender;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  threadId,
  targetAgent,
  placeholder = 'Type a message...',
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

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
      });
    } catch (error) {
      console.error('[ChatInput] Failed to send message:', error);
      // Restore text on error
      setText(trimmedText);
    } finally {
      setIsSending(false);
    }
  }, [text, threadId, targetAgent, isSending]);

  const canSend = text.trim().length > 0 && !disabled && !isSending;

  return (
    <View className="flex-row items-end p-3 border-t border-neutral-700 bg-surface">
      <TextInput
        className="flex-1 bg-neutral-800 text-white font-body px-4 py-3 mr-2"
        style={{
          borderRadius: '12px 16px 12px 14px',
          minHeight: 44,
          maxHeight: 120,
        }}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        multiline
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={`px-4 py-3 ${canSend ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
        style={{ borderRadius: '12px 14px 10px 16px' }}
      >
        <Text className={`font-body font-semibold ${canSend ? 'text-white' : 'text-neutral-500'}`}>
          {isSending ? '...' : 'Send'}
        </Text>
      </Pressable>
    </View>
  );
}
