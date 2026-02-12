import { render } from '@testing-library/react-native';
import { ChatThread } from '../ChatThread';

jest.mock('@/components/icons', () => ({
  BranchIcon: () => 'BranchIcon',
  EditIcon: () => 'EditIcon',
  FileIcon: () => 'FileIcon',
  GitIcon: () => 'GitIcon',
  LightningIcon: () => 'LightningIcon',
}));

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: {
    pill: {},
    chatBubbleUser: {},
    chatBubbleAgent: {},
    card: {},
    badge: {},
    button: {},
    codeBlock: {},
  },
}));

jest.mock('@/utils/design-tokens', () => ({
  getColor: jest.fn(() => '#000000'),
}));

jest.mock('../CodeBlock', () => ({
  CodeBlock: ({ code }: { code: string }) => code,
}));

jest.mock('@/services/chat', () => ({
  ChatService: {
    respondToApproval: jest.fn(),
  },
}));

const mockMessages = [
  {
    id: 'msg-1',
    threadId: 'thread-1',
    sender: 'user',
    content: 'Build a login page',
    contentType: 'text',
    status: 'sent',
    timestamp: '2024-01-01T12:00:00Z',
  },
  {
    id: 'msg-2',
    threadId: 'thread-1',
    sender: 'architect',
    content: 'I will design the login page with OAuth support.',
    contentType: 'text',
    status: 'sent',
    timestamp: '2024-01-01T12:01:00Z',
  },
];

jest.mock('@thumbcode/state', () => ({
  useChatStore: jest.fn((selector: (state: unknown) => unknown) =>
    selector({
      threads: {
        'thread-1': {
          id: 'thread-1',
          messages: mockMessages,
          typingIndicators: {},
        },
      },
    })
  ),
  selectThreadMessages: jest.fn(() => () => mockMessages),
  selectTypingIndicators: jest.fn(() => () => []),
}));

describe('ChatThread', () => {
  it('renders messages from thread', () => {
    const { toJSON } = render(<ChatThread threadId="thread-1" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Build a login page');
    expect(json).toContain('I will design the login page with OAuth support.');
  });

  it('shows empty state when no messages', () => {
    const { useChatStore, selectThreadMessages, selectTypingIndicators } =
      require('@thumbcode/state');
    selectThreadMessages.mockReturnValue(() => []);
    selectTypingIndicators.mockReturnValue(() => []);
    useChatStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        threads: {
          'thread-empty': { id: 'thread-empty', messages: [], typingIndicators: {} },
        },
      })
    );

    const { toJSON } = render(<ChatThread threadId="thread-empty" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Start the conversation');
    expect(json).toContain('Send a message to begin collaborating with AI agents');
  });

  it('shows typing indicator when agents are typing', () => {
    const { useChatStore, selectThreadMessages, selectTypingIndicators } =
      require('@thumbcode/state');
    selectThreadMessages.mockReturnValue(() => mockMessages);
    selectTypingIndicators.mockReturnValue(() => ['architect']);
    useChatStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        threads: {
          'thread-1': {
            id: 'thread-1',
            messages: mockMessages,
            typingIndicators: { architect: true },
          },
        },
      })
    );

    const { toJSON } = render(<ChatThread threadId="thread-1" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Architect is typing');
  });
});
