// packages/agent-intelligence/src/components/chat/ChatInput.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useChatStore } from '../../stores/chatStore';

const ChatInput = () => {
  const [text, setText] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = () => {
    if (text.trim()) {
      addMessage({
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      });
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#CCC',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
});

export default ChatInput;
