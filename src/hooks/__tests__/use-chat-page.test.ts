import { act, renderHook } from '@testing-library/react';
import { useChatPage } from '../use-chat-page';

const mockSetActiveThread = vi.fn();
const mockCreateThread = vi.fn().mockReturnValue('new-thread-id');

vi.mock('@thumbcode/state', () => ({
  useChatStore: vi.fn((selector: any) =>
    selector({
      activeThreadId: 'thread-1',
      setActiveThread: mockSetActiveThread,
      threads: [
        { id: 'thread-1', title: 'First Thread' },
        { id: 'thread-2', title: 'Second Thread' },
      ],
    })
  ),
}));

vi.mock('@/services/chat', () => ({
  ChatService: {
    createThread: (...args: any[]) => mockCreateThread(...args),
  },
}));

describe('useChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateThread.mockReturnValue('new-thread-id');
  });

  it('returns activeThreadId from store', () => {
    const { result } = renderHook(() => useChatPage());
    expect(result.current.activeThreadId).toBe('thread-1');
  });

  it('returns activeThreadTitle for active thread', () => {
    const { result } = renderHook(() => useChatPage());
    expect(result.current.activeThreadTitle).toBe('First Thread');
  });

  it('provides setActiveThread function', () => {
    const { result } = renderHook(() => useChatPage());
    act(() => {
      result.current.setActiveThread('thread-2');
    });
    expect(mockSetActiveThread).toHaveBeenCalledWith('thread-2');
  });

  it('handleCreateThread creates thread and sets it active', () => {
    const { result } = renderHook(() => useChatPage());
    act(() => {
      result.current.handleCreateThread();
    });
    expect(mockCreateThread).toHaveBeenCalledWith({
      title: 'New thread',
      participants: ['user', 'architect', 'implementer', 'reviewer', 'tester'],
    });
    expect(mockSetActiveThread).toHaveBeenCalledWith('new-thread-id');
  });
});
