// app/(tabs)/chat.tsx
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ChatBubble from '@thumbcode/agent-intelligence/src/components/chat/ChatBubble';
import ChatInput from '@thumbcode/agent-intelligence/src/components/chat/ChatInput';
import { useChatStore } from '@thumbcode/agent-intelligence/src/stores/chatStore';

const ChatScreen = () => {
  const messages = useChatStore((state) => state.messages);

  return (
    <View style={styles.container}>
import React, { useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useChatStore } from '@/store/chatStore';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';

const ChatScreen = () => {
  const messages = useChatStore((state) => state.messages);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <ChatInput />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 16,
  },
});

export default ChatScreen;
      <ChatInput />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    padding: 8,
  },
});

export default ChatScreen;
