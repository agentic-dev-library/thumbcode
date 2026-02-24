/**
 * useChatPage Hook
 *
 * Manages chat page state: active thread selection, thread creation,
 * and thread metadata. Keeps the chat page a thin composition layer.
 */

import { useChatStore } from '@/state';
import { useCallback } from 'react';
import { ChatService } from '@/services/chat';

export interface UseChatPageResult {
  activeThreadId: string | null;
  activeThreadTitle: string | undefined;
  setActiveThread: (id: string | null) => void;
  handleCreateThread: () => void;
}

export function useChatPage(): UseChatPageResult {
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const setActiveThread = useChatStore((s) => s.setActiveThread);

  const activeThreadTitle = useChatStore((s) =>
    s.activeThreadId ? s.threads.find((t) => t.id === s.activeThreadId)?.title : undefined
  );

  const handleCreateThread = useCallback(() => {
    const id = ChatService.createThread({
      title: 'New thread',
      participants: ['user', 'architect', 'implementer', 'reviewer', 'tester'],
    });
    setActiveThread(id);
  }, [setActiveThread]);

  return {
    activeThreadId,
    activeThreadTitle,
    setActiveThread,
    handleCreateThread,
  };
}
