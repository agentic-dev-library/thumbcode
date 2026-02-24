import { render, screen } from '@testing-library/react';
import type { Message } from '@/state';
import { ChatThread } from '../ChatThread';

vi.mock('@/components/icons', () => ({
  BranchIcon: () => <span>BranchIcon</span>,
  EditIcon: () => <span>EditIcon</span>,
  FileIcon: () => <span>FileIcon</span>,
  GitIcon: () => <span>GitIcon</span>,
  LightningIcon: () => <span>LightningIcon</span>,
}));

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn(() => '#000000'),
}));

vi.mock('../CodeBlock', () => ({
  CodeBlock: ({ code }: { code: string }) => <span>{code}</span>,
}));

vi.mock('@/services/chat', () => ({
  ChatService: {
    respondToApproval: vi.fn(),
  },
}));

const mockMessages: Message[] = [
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

vi.mock('@/state', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  useChatStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
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

import { selectThreadMessages, selectTypingIndicators, useChatStore } from '@/state';

describe('ChatThread', () => {
  it('renders messages from thread', () => {
    render(<ChatThread threadId="thread-1" />);
    expect(screen.getByText('Build a login page')).toBeTruthy();
    expect(screen.getByText('I will design the login page with OAuth support.')).toBeTruthy();
  });

  it('shows empty state when no messages', () => {
    vi.mocked(selectThreadMessages).mockReturnValue(() => []);
    vi.mocked(selectTypingIndicators).mockReturnValue(() => []);
    vi.mocked(useChatStore).mockImplementation(
      // biome-ignore lint/suspicious/noExplicitAny: test mock needs flexible selector type
      (selector: any) =>
        selector({
          threads: {
            'thread-empty': { id: 'thread-empty', messages: [], typingIndicators: {} },
          },
        })
    );

    render(<ChatThread threadId="thread-empty" />);
    expect(screen.getByText('Start the conversation')).toBeTruthy();
    expect(screen.getByText('Send a message to begin collaborating with AI agents')).toBeTruthy();
  });

  it('shows typing indicator when agents are typing', () => {
    vi.mocked(selectThreadMessages).mockReturnValue(() => mockMessages);
    vi.mocked(selectTypingIndicators).mockReturnValue(() => ['architect']);
    vi.mocked(useChatStore).mockImplementation(
      // biome-ignore lint/suspicious/noExplicitAny: test mock needs flexible selector type
      (selector: any) =>
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

    render(<ChatThread threadId="thread-1" />);
    expect(screen.getByText('Architect is typing...')).toBeTruthy();
  });
});
