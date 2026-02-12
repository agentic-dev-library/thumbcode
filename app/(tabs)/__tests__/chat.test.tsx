import { render } from '@testing-library/react';
import ChatScreen from '../chat';

// Mock @thumbcode/state stores
vi.mock('@thumbcode/state', () => ({
  useChatStore: vi.fn((selector) =>
    selector({
      activeThreadId: null,
      threads: [],
      messages: {},
      isTyping: {},
      setActiveThread: vi.fn(),
      respondToApproval: vi.fn(),
    })
  ),
  useProjectStore: vi.fn((selector) => selector({ projects: [] })),
  useUserStore: vi.fn((selector) => selector({ githubProfile: null })),
}));

// Mock @thumbcode/core
vi.mock('@thumbcode/core', () => ({
  GitService: {
    stage: vi.fn(),
    commit: vi.fn(),
  },
}));

// Mock chat service
vi.mock('@/services/chat', () => ({
  ChatService: {
    createThread: vi.fn(() => 'thread-1'),
    sendMessage: vi.fn(),
  },
}));

// Mock chat components to avoid deep dependency chain
vi.mock('@/components/chat', () => ({
  ChatInput: () => null,
  ChatMessage: () => null,
  ThreadList: () => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>Thread List</Text>
      </View>
    );
  },
}));

describe('ChatScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ChatScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows thread list when no active thread', () => {
    const { toJSON } = render(<ChatScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Thread List');
  });
});
