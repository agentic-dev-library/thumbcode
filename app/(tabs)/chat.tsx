/**
 * Chat Screen
 *
 * Main chat interface for human-agent communication.
 * Uses simplified mock components for demonstration.
 */

import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/display';
import { HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

// Simple message type for the mock screen
interface MockMessage {
  id: string;
  sender: 'user' | 'architect' | 'implementer' | 'reviewer' | 'tester';
  text: string;
  code?: {
    language: string;
    content: string;
    filename?: string;
  };
  timestamp: Date;
}

// Mock data
const MOCK_MESSAGES: MockMessage[] = [
  {
    id: '1',
    sender: 'architect',
    text: "I've analyzed the project requirements and created a task breakdown for the authentication module.",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    sender: 'user',
    text: "Great! Let's start with the login flow. Can you implement it using OAuth?",
    timestamp: new Date(Date.now() - 3000000),
  },
  {
    id: '3',
    sender: 'implementer',
    text: "I've started implementing the OAuth login flow. Here's the initial implementation:",
    code: {
      language: 'typescript',
      content: `async function handleOAuthLogin(provider: string) {
  const authUrl = await getAuthorizationUrl(provider);
  const result = await WebBrowser.openAuthSessionAsync(authUrl);

  if (result.type === 'success') {
    const tokens = await exchangeCodeForTokens(result.url);
    await secureStore.setItem('auth_tokens', tokens);
  }
}`,
      filename: 'src/services/auth.ts',
    },
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: '4',
    sender: 'reviewer',
    text: "I've reviewed the implementation. It looks good but needs some error handling. Please add try-catch blocks and handle token expiry.",
    timestamp: new Date(Date.now() - 900000),
  },
];

function getAgentInfo(sender: MockMessage['sender']): {
  name: string;
  avatar: string;
  color: string;
} {
  switch (sender) {
    case 'architect':
      return { name: 'Architect', avatar: '🏛️', color: 'text-gold-400' };
    case 'implementer':
      return { name: 'Implementer', avatar: '⚡', color: 'text-teal-400' };
    case 'reviewer':
      return { name: 'Reviewer', avatar: '🔍', color: 'text-coral-400' };
    case 'tester':
      return { name: 'Tester', avatar: '🧪', color: 'text-purple-400' };
    default:
      return { name: 'You', avatar: '👤', color: 'text-white' };
  }
}

function MockMessageBubble({ message }: { message: MockMessage }) {
  const isUser = message.sender === 'user';
  const agentInfo = getAgentInfo(message.sender);

  return (
    <View className={`px-4 py-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && (
        <HStack spacing="sm" align="center" className="mb-2">
          <View
            className="w-8 h-8 bg-surface items-center justify-center"
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 12,
              borderBottomLeftRadius: 6,
            }}
          >
            <Text>{agentInfo.avatar}</Text>
          </View>
          <Text size="sm" weight="semibold" className={agentInfo.color}>
            {agentInfo.name}
          </Text>
        </HStack>
      )}

      <View
        className={`max-w-[85%] p-3 ${isUser ? 'bg-coral-500' : 'bg-surface'}`}
        style={{
          borderTopLeftRadius: isUser ? 16 : 4,
          borderTopRightRadius: isUser ? 4 : 16,
          borderBottomRightRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      >
        <Text className={isUser ? 'text-white' : 'text-neutral-200'}>{message.text}</Text>

        {message.code && (
          <View
            className="mt-3 bg-charcoal p-3"
            style={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              borderBottomLeftRadius: 8,
            }}
          >
            {message.code.filename && (
              <Text size="xs" className="text-neutral-500 mb-2">
                {message.code.filename}
              </Text>
            )}
            <Text size="sm" className="text-teal-400 font-mono">
              {message.code.content}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function MockApprovalCard({
  onApprove,
  onReject,
}: {
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <View
      className="bg-surface p-4"
      style={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 12,
      }}
    >
      <HStack justify="between" align="center" className="mb-3">
        <HStack spacing="sm" align="center">
          <Text className="text-xl">📝</Text>
          <Text weight="semibold" className="text-white">
            Ready to commit changes?
          </Text>
        </HStack>
        <Badge variant="warning">Pending</Badge>
      </HStack>

      <Text size="sm" className="text-neutral-400 mb-4">
        The authentication module implementation is ready for commit.
      </Text>

      <VStack spacing="xs" className="mb-4">
        <HStack spacing="sm" align="center">
          <Text size="sm" className="text-gold-400">
            M
          </Text>
          <Text size="sm" className="text-neutral-300">
            src/services/auth.ts
          </Text>
        </HStack>
        <HStack spacing="sm" align="center">
          <Text size="sm" className="text-teal-400">
            A
          </Text>
          <Text size="sm" className="text-neutral-300">
            src/hooks/useAuth.ts
          </Text>
        </HStack>
      </VStack>

      <HStack spacing="sm">
        <Pressable
          onPress={onReject}
          className="flex-1 bg-surface-elevated py-3 active:bg-neutral-700"
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 6,
          }}
        >
          <Text className="text-center text-neutral-400">Reject</Text>
        </Pressable>
        <Pressable
          onPress={onApprove}
          className="flex-1 bg-teal-600 py-3 active:bg-teal-700"
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 6,
          }}
        >
          <Text className="text-center text-white font-semibold">Approve</Text>
        </Pressable>
      </HStack>
    </View>
  );
}

function MockChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <HStack spacing="sm" align="center">
      <View
        className="flex-1 bg-surface px-4 py-3"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 18,
          borderBottomRightRadius: 22,
          borderBottomLeftRadius: 16,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message your AI team..."
          placeholderTextColor="#6B7280"
          className="text-white font-body"
          multiline
          onSubmitEditing={handleSend}
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={!text.trim()}
        className={`w-12 h-12 items-center justify-center ${text.trim() ? 'bg-coral-500' : 'bg-surface'}`}
        style={{
          borderTopLeftRadius: 14,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 16,
          borderBottomLeftRadius: 10,
        }}
      >
        <Text className={text.trim() ? 'text-white' : 'text-neutral-500'}>↑</Text>
      </Pressable>
    </HStack>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [showApproval, setShowApproval] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = (text: string) => {
    const newMessage: MockMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleApprove = () => {
    setShowApproval(false);
    // TODO: Trigger commit
  };

  const handleReject = () => {
    setShowApproval(false);
    // TODO: Request changes
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-charcoal"
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MockMessageBubble message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: showApproval ? 200 : 100,
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Approval Card */}
      {showApproval && (
        <View className="absolute left-4 right-4" style={{ bottom: 100 + insets.bottom }}>
          <MockApprovalCard onApprove={handleApprove} onReject={handleReject} />
        </View>
      )}

      {/* Input */}
      <View
        className="border-t border-neutral-800 px-4 py-3 bg-charcoal"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <MockChatInput onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}
