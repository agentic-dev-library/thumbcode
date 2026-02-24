import { fireEvent, render, screen } from '@testing-library/react';
import { ThreadList } from '../ThreadList';

vi.mock('@/state', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  useChatStore: vi.fn(),
  selectPinnedThreads: vi.fn(),
  selectRecentThreads: vi.fn(),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: unknown) => fn,
}));

vi.mock('@/components/display', () => ({
  Badge: ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/lib/chat-utils', () => ({
  formatRelativeTime: vi.fn((_ts: string) => '2 min ago'),
  getParticipantColor: vi.fn(() => 'bg-teal-500'),
}));

import { selectPinnedThreads, selectRecentThreads, useChatStore } from '@/state';

function setupStore(
  pinned: Record<string, unknown>[] = [],
  recent: Record<string, unknown>[] = []
) {
  vi.mocked(selectPinnedThreads).mockReturnValue(pinned as never);
  vi.mocked(selectRecentThreads).mockReturnValue(recent as never);
  // biome-ignore lint/suspicious/noExplicitAny: test mock needs flexible selector type for Zustand store
  vi.mocked(useChatStore).mockImplementation((selector: any) => {
    if (selector === selectPinnedThreads || selector.toString().includes('pinned')) return pinned;
    if (selector === selectRecentThreads || selector.toString().includes('recent')) return recent;
    return selector({
      threads: [...pinned, ...recent],
      messages: {},
    });
  });
}

const mockThread = (overrides: Record<string, unknown> = {}) => ({
  id: 'thread-1',
  title: 'Test Thread',
  participants: ['user', 'architect'],
  lastMessageAt: '2024-01-01T12:00:00Z',
  unreadCount: 0,
  isPinned: false,
  ...overrides,
});

describe('ThreadList', () => {
  const onSelectThread = vi.fn();
  const onCreateThread = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no threads', () => {
    setupStore([], []);
    render(<ThreadList onSelectThread={onSelectThread} onCreateThread={onCreateThread} />);
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    expect(
      screen.getByText('Start a new thread to collaborate with AI agents')
    ).toBeInTheDocument();
  });

  it('shows new thread button in empty state', () => {
    setupStore([], []);
    render(<ThreadList onSelectThread={onSelectThread} onCreateThread={onCreateThread} />);
    fireEvent.click(screen.getByLabelText('New Thread'));
    expect(onCreateThread).toHaveBeenCalledOnce();
  });

  it('renders recent threads', () => {
    setupStore([], [mockThread({ id: 't-1', title: 'Recent Chat' })]);
    render(<ThreadList onSelectThread={onSelectThread} />);
    expect(screen.getByText('Recent Chat')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });

  it('renders pinned threads with label', () => {
    setupStore(
      [mockThread({ id: 't-pinned', title: 'Pinned Chat', isPinned: true })],
      [mockThread({ id: 't-recent', title: 'Recent Chat' })]
    );
    render(<ThreadList onSelectThread={onSelectThread} />);
    expect(screen.getByText('Pinned Chat')).toBeInTheDocument();
    expect(screen.getAllByText('Pinned').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectThread when thread clicked', () => {
    setupStore([], [mockThread({ id: 't-1', title: 'Clickable' })]);
    render(<ThreadList onSelectThread={onSelectThread} />);
    fireEvent.click(screen.getByText('Clickable'));
    expect(onSelectThread).toHaveBeenCalledWith('t-1');
  });

  it('shows unread badge for threads with unread messages', () => {
    setupStore([], [mockThread({ id: 't-1', title: 'Unread Thread', unreadCount: 5 })]);
    render(<ThreadList onSelectThread={onSelectThread} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 99+ for large unread counts', () => {
    setupStore([], [mockThread({ id: 't-1', title: 'Many Unread', unreadCount: 150 })]);
    render(<ThreadList onSelectThread={onSelectThread} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});
