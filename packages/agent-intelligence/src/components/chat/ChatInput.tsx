import { styled } from 'nativewind';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useChatStore } from '@thumbcode/state';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const ChatInput = () => {
  const [text, setText] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = () => {
    if (text.trim()) {
      addMessage({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        text,
        sender: 'user',
        timestamp: new Date(),
      });
      setText('');
    }
  };

  return (
    <StyledView className="flex-row p-2 border-t border-neutral-200 bg-surface">
      <StyledTextInput
        className="flex-1 border border-neutral-300 bg-neutral-800 text-white font-body px-3 mr-2"
        style={{
          borderRadius: '0.5rem 0.625rem 0.5rem 0.75rem',
        }}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#94A3B8"
      />
      <StyledTouchableOpacity
        className="bg-coral-500 px-4 justify-center active:bg-coral-700"
        style={{
          borderRadius: '0.5rem 0.75rem 0.625rem 0.875rem',
        }}
        onPress={handleSend}
      >
        <StyledText className="text-white font-body font-semibold">Send</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};

export default ChatInput;
