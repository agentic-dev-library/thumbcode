/**
 * Chat Page Tests
 *
 * Verifies the chat page renders as a thin composition layer
 * consuming the useChatPage hook. Tests both the thread list
 * view (no active thread) and active thread view.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatPage from '../chat';

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockSetActiveThread = vi.fn();
const mockHandleCreateThread = vi.fn();

let mockHookReturn = {
  activeThreadId: null as string | null,
  activeThreadTitle: undefined as string | undefined,
  setActiveThread: mockSetActiveThread,
  handleCreateThread: mockHandleCreateThread,
};

vi.mock('@/hooks/use-chat-page', () => ({
  useChatPage: () => mockHookReturn,
}));

vi.mock('@/components/chat', () => ({
  ThreadList: ({
    onSelectThread,
    onCreateThread,
  }: {
    onSelectThread: (id: string) => void;
    onCreateThread: () => void;
  }) => (
    <div data-testid="thread-list">
      <button
        type="button"
        data-testid="select-thread-btn"
        onClick={() => onSelectThread('thread-1')}
      >
        Select Thread
      </button>
      <button type="button" data-testid="create-thread-btn" onClick={() => onCreateThread()}>
        Create Thread
      </button>
    </div>
  ),
  ChatThread: ({ threadId }: { threadId: string }) => (
    <div data-testid="chat-thread">Thread: {threadId}</div>
  ),
  ChatInput: ({ threadId }: { threadId: string }) => (
    <div data-testid="chat-input">Input for: {threadId}</div>
  ),
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookReturn = {
      activeThreadId: null,
      activeThreadTitle: undefined,
      setActiveThread: mockSetActiveThread,
      handleCreateThread: mockHandleCreateThread,
    };
  });

  it('renders the chat screen test id', () => {
    render(<ChatPage />);
    expect(screen.getByTestId('chat-screen')).toBeInTheDocument();
  });

  it('renders thread list when no active thread', () => {
    render(<ChatPage />);
    expect(screen.getByTestId('thread-list')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-thread')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument();
  });

  it('calls setActiveThread when a thread is selected from the list', () => {
    render(<ChatPage />);
    fireEvent.click(screen.getByTestId('select-thread-btn'));
    expect(mockSetActiveThread).toHaveBeenCalledWith('thread-1');
  });

  it('calls handleCreateThread when creating a new thread', () => {
    render(<ChatPage />);
    fireEvent.click(screen.getByTestId('create-thread-btn'));
    expect(mockHandleCreateThread).toHaveBeenCalledTimes(1);
  });

  it('renders ChatThread and ChatInput when a thread is active', () => {
    mockHookReturn = {
      ...mockHookReturn,
      activeThreadId: 'thread-42',
      activeThreadTitle: 'Architecture Review',
    };

    render(<ChatPage />);
    expect(screen.getByTestId('chat-thread')).toBeInTheDocument();
    expect(screen.getByText('Thread: thread-42')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByText('Input for: thread-42')).toBeInTheDocument();
  });

  it('displays the active thread title in the header', () => {
    mockHookReturn = {
      ...mockHookReturn,
      activeThreadId: 'thread-42',
      activeThreadTitle: 'Architecture Review',
    };

    render(<ChatPage />);
    expect(screen.getByText('Architecture Review')).toBeInTheDocument();
  });

  it('displays "Chat" when active thread has no title', () => {
    mockHookReturn = {
      ...mockHookReturn,
      activeThreadId: 'thread-99',
      activeThreadTitle: undefined,
    };

    render(<ChatPage />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('renders back button when a thread is active', () => {
    mockHookReturn = {
      ...mockHookReturn,
      activeThreadId: 'thread-42',
      activeThreadTitle: 'Test Thread',
    };

    render(<ChatPage />);
    const backButton = screen.getByLabelText('Back to thread list');
    expect(backButton).toBeInTheDocument();
  });

  it('calls setActiveThread(null) when back button is clicked', () => {
    mockHookReturn = {
      ...mockHookReturn,
      activeThreadId: 'thread-42',
      activeThreadTitle: 'Test Thread',
    };

    render(<ChatPage />);
    fireEvent.click(screen.getByLabelText('Back to thread list'));
    expect(mockSetActiveThread).toHaveBeenCalledWith(null);
  });
});
