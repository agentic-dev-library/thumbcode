// packages/agent-intelligence/src/components/chat/ChatBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const ChatBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userBubble : styles.agentBubble,
      ]}
    >
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#0D9488',
    alignSelf: 'flex-end',
  },
  agentBubble: {
    backgroundColor: '#FF7059',
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
  },
});

export default ChatBubble;
