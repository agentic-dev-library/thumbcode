import { render } from '@testing-library/react';
import { ChatThread } from '../ChatThread';

vi.mock('@/components/icons', () => ({
  BranchIcon: () => 'BranchIcon',
  EditIcon: () => 'EditIcon',
  FileIcon: () => 'FileIcon',
  GitIcon: () => 'GitIcon',
  LightningIcon: () => 'LightningIcon',
}));

vi.mock('@/lib/organic-styles', () => ({
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

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn(() => '#000000'),
}));

vi.mock('../CodeBlock', () => ({
  CodeBlock: ({ code }: { code: string }) => code,
}));

vi.mock('@/services/chat', () => ({
  ChatService: {
    respondToApproval: vi.fn(),
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

vi.mock('@thumbcode/state', () => ({
  useChatStore: vi.fn((selector: (state: unknown) => unknown) =>
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
  selectThreadMessages: vi.fn(() => () => mockMessages),
  selectTypingIndicators: vi.fn(() => () => []),
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
