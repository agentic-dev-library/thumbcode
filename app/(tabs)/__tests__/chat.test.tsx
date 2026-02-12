import { render } from '@testing-library/react-native';
import ChatScreen from '../chat';

// Mock @thumbcode/state stores
jest.mock('@thumbcode/state', () => ({
  useChatStore: jest.fn((selector) =>
    selector({
      activeThreadId: null,
      threads: [],
      messages: {},
      isTyping: {},
      setActiveThread: jest.fn(),
      respondToApproval: jest.fn(),
    })
  ),
  useProjectStore: jest.fn((selector) =>
    selector({ projects: [] })
  ),
  useUserStore: jest.fn((selector) =>
    selector({ githubProfile: null })
  ),
}));

// Mock @thumbcode/core
jest.mock('@thumbcode/core', () => ({
  GitService: {
    stage: jest.fn(),
    commit: jest.fn(),
  },
}));

// Mock chat service
jest.mock('@/services/chat', () => ({
  ChatService: {
    createThread: jest.fn(() => 'thread-1'),
    sendMessage: jest.fn(),
  },
}));

// Mock chat components to avoid deep dependency chain
jest.mock('@/components/chat', () => ({
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
