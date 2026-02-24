import { act } from '@testing-library/react';
import {
  selectActiveThread,
  selectActiveThreadMessages,
  selectPendingApprovals,
  selectPinnedThreads,
  selectRecentThreads,
  selectThreadMessages,
  selectThreads,
  selectTypingIndicators,
  selectUnreadCount,
  useChatStore,
} from '../chatStore';

describe('ChatStore', () => {
  beforeEach(() => {
    act(() => useChatStore.getState().clearAllThreads());
  });

  describe('thread operations', () => {
    it('creates a thread with generated id and timestamps', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Test Thread',
          participants: ['user', 'architect'],
          isPinned: false,
        });
      });
      const state = useChatStore.getState();
      const thread = state.threads.find((t) => t.id === threadId);
      expect(thread).toBeDefined();
      expect(thread?.title).toBe('Test Thread');
      expect(thread?.unreadCount).toBe(0);
      expect(thread?.createdAt).toBeDefined();
    });

    it('deletes a thread and its messages', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'To Delete',
          participants: ['user'],
          isPinned: false,
        });
      });
      act(() => useChatStore.getState().deleteThread(threadId));
      expect(useChatStore.getState().threads).toHaveLength(0);
    });

    it('clears activeThreadId when active thread is deleted', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Active',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().setActiveThread(threadId);
      });
      act(() => useChatStore.getState().deleteThread(threadId));
      expect(useChatStore.getState().activeThreadId).toBeNull();
    });

    it('sets active thread and marks as read', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Thread',
          participants: ['user', 'architect'],
          isPinned: false,
        });
        // Add an agent message to bump unread
        useChatStore.getState().addMessage({
          threadId,
          content: 'Hello',
          contentType: 'text',
          sender: 'architect',
        });
      });
      // Now set active - should clear unread
      act(() => useChatStore.getState().setActiveThread(threadId));
      const thread = useChatStore.getState().threads.find((t) => t.id === threadId);
      expect(thread?.unreadCount).toBe(0);
    });

    it('sets activeThread to null', () => {
      act(() => useChatStore.getState().setActiveThread(null));
      expect(useChatStore.getState().activeThreadId).toBeNull();
    });

    it('updates thread properties', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Old',
          participants: ['user'],
          isPinned: false,
        });
      });
      act(() => useChatStore.getState().updateThread(threadId, { title: 'New' }));
      const thread = useChatStore.getState().threads.find((t) => t.id === threadId);
      expect(thread?.title).toBe('New');
    });

    it('pins and unpins thread', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Pinnable',
          participants: ['user'],
          isPinned: false,
        });
      });
      act(() => useChatStore.getState().pinThread(threadId, true));
      expect(useChatStore.getState().threads[0].isPinned).toBe(true);
      act(() => useChatStore.getState().pinThread(threadId, false));
      expect(useChatStore.getState().threads[0].isPinned).toBe(false);
    });

    it('marks thread as read', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Unread',
          participants: ['user', 'architect'],
          isPinned: false,
        });
        useChatStore.getState().addMessage({
          threadId,
          content: 'msg',
          contentType: 'text',
          sender: 'architect',
        });
      });
      act(() => useChatStore.getState().markThreadAsRead(threadId));
      expect(useChatStore.getState().threads[0].unreadCount).toBe(0);
    });
  });

  describe('message operations', () => {
    let threadId = '';

    beforeEach(() => {
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Messages',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().setActiveThread(threadId);
      });
    });

    it('adds a message with generated id and sending status', () => {
      let msgId = '';
      act(() => {
        msgId = useChatStore.getState().addMessage({
          threadId,
          content: 'Hello',
          contentType: 'text',
          sender: 'user',
        });
      });
      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      expect(msgs[0].id).toBe(msgId);
      expect(msgs[0].status).toBe('sending');
    });

    it('increments unread for non-active thread agent messages', () => {
      act(() => useChatStore.getState().setActiveThread(null));
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Agent msg',
          contentType: 'text',
          sender: 'architect',
        });
      });
      const thread = useChatStore.getState().threads.find((t) => t.id === threadId);
      expect(thread?.unreadCount).toBe(1);
    });

    it('does not increment unread for user messages', () => {
      act(() => useChatStore.getState().setActiveThread(null));
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'User msg',
          contentType: 'text',
          sender: 'user',
        });
      });
      const thread = useChatStore.getState().threads.find((t) => t.id === threadId);
      expect(thread?.unreadCount).toBe(0);
    });

    it('updates message content', () => {
      let msgId = '';
      act(() => {
        msgId = useChatStore.getState().addMessage({
          threadId,
          content: 'Original',
          contentType: 'text',
          sender: 'user',
        });
      });
      act(() => useChatStore.getState().updateMessageContent(msgId, threadId, 'Updated'));
      const msg = useChatStore.getState().messages[threadId].find((m) => m.id === msgId);
      expect(msg?.content).toBe('Updated');
    });

    it('updates message status', () => {
      let msgId = '';
      act(() => {
        msgId = useChatStore.getState().addMessage({
          threadId,
          content: 'Hello',
          contentType: 'text',
          sender: 'user',
        });
      });
      act(() => useChatStore.getState().updateMessageStatus(msgId, threadId, 'delivered'));
      const msg = useChatStore.getState().messages[threadId].find((m) => m.id === msgId);
      expect(msg?.status).toBe('delivered');
    });

    it('deletes a message', () => {
      let msgId = '';
      act(() => {
        msgId = useChatStore.getState().addMessage({
          threadId,
          content: 'Delete me',
          contentType: 'text',
          sender: 'user',
        });
      });
      act(() => useChatStore.getState().deleteMessage(msgId, threadId));
      expect(useChatStore.getState().messages[threadId]).toHaveLength(0);
    });
  });

  describe('approval operations', () => {
    it('responds to approval request', () => {
      let threadId = '';
      let msgId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Approvals',
          participants: ['user', 'implementer'],
          isPinned: false,
        });
        msgId = useChatStore.getState().addMessage({
          threadId,
          content: 'Please approve commit',
          contentType: 'approval_request',
          sender: 'implementer',
          metadata: {
            actionType: 'commit',
            actionDescription: 'Initial commit',
          },
        });
      });
      act(() => useChatStore.getState().respondToApproval(msgId, threadId, true));
      const msg = useChatStore.getState().messages[threadId].find((m) => m.id === msgId);
      const metadata = msg?.metadata as { approved: boolean; respondedAt: string };
      expect(metadata.approved).toBe(true);
      expect(metadata.respondedAt).toBeDefined();
    });
  });

  describe('typing indicators', () => {
    it('adds typing indicator', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Typing',
          participants: ['user', 'architect'],
          isPinned: false,
        });
      });
      act(() => useChatStore.getState().setTyping(threadId, 'architect', true));
      expect(useChatStore.getState().isTyping[threadId]).toContain('architect');
    });

    it('removes typing indicator', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Typing',
          participants: ['user', 'architect'],
          isPinned: false,
        });
        useChatStore.getState().setTyping(threadId, 'architect', true);
      });
      act(() => useChatStore.getState().setTyping(threadId, 'architect', false));
      expect(useChatStore.getState().isTyping[threadId]).not.toContain('architect');
    });

    it('does not add duplicate typing indicators', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Typing',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().setTyping(threadId, 'architect', true);
      });
      act(() => useChatStore.getState().setTyping(threadId, 'architect', true));
      expect(
        useChatStore.getState().isTyping[threadId].filter((s) => s === 'architect')
      ).toHaveLength(1);
    });
  });

  describe('bulk operations', () => {
    it("clears a thread's messages", () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Clear me',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().addMessage({
          threadId,
          content: 'msg',
          contentType: 'text',
          sender: 'user',
        });
      });
      act(() => useChatStore.getState().clearThread(threadId));
      expect(useChatStore.getState().messages[threadId]).toHaveLength(0);
    });

    it('clears all threads', () => {
      act(() => {
        useChatStore.getState().createThread({
          title: 'T1',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().createThread({
          title: 'T2',
          participants: ['user'],
          isPinned: false,
        });
      });
      act(() => useChatStore.getState().clearAllThreads());
      expect(useChatStore.getState().threads).toHaveLength(0);
      expect(useChatStore.getState().activeThreadId).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectThreads returns threads', () => {
      act(() => {
        useChatStore.getState().createThread({
          title: 'T1',
          participants: ['user'],
          isPinned: false,
        });
      });
      const threads = selectThreads(useChatStore.getState());
      expect(threads).toHaveLength(1);
    });

    it('selectActiveThread returns active thread or null', () => {
      const result = selectActiveThread(useChatStore.getState());
      expect(result).toBeNull();

      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Active',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().setActiveThread(threadId);
      });
      const active = selectActiveThread(useChatStore.getState());
      expect(active?.title).toBe('Active');
    });

    it('selectActiveThreadMessages returns messages for active thread', () => {
      const emptyMsgs = selectActiveThreadMessages(useChatStore.getState());
      expect(emptyMsgs).toHaveLength(0);

      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'T',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().setActiveThread(threadId);
        useChatStore.getState().addMessage({
          threadId,
          content: 'hi',
          contentType: 'text',
          sender: 'user',
        });
      });
      const msgs = selectActiveThreadMessages(useChatStore.getState());
      expect(msgs).toHaveLength(1);
    });

    it('selectThreadMessages returns messages for a specific thread', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'T',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().addMessage({
          threadId,
          content: 'hi',
          contentType: 'text',
          sender: 'user',
        });
      });
      const msgs = selectThreadMessages(threadId)(useChatStore.getState());
      expect(msgs).toHaveLength(1);
    });

    it('selectUnreadCount totals unread across threads', () => {
      let t1 = '';
      let t2 = '';
      act(() => {
        t1 = useChatStore.getState().createThread({
          title: 'T1',
          participants: ['user', 'architect'],
          isPinned: false,
        });
        t2 = useChatStore.getState().createThread({
          title: 'T2',
          participants: ['user', 'implementer'],
          isPinned: false,
        });
        // Messages from agents to inactive threads
        useChatStore.getState().setActiveThread(null);
        useChatStore
          .getState()
          .addMessage({ threadId: t1, content: 'a', contentType: 'text', sender: 'architect' });
        useChatStore
          .getState()
          .addMessage({ threadId: t2, content: 'b', contentType: 'text', sender: 'implementer' });
      });
      expect(selectUnreadCount(useChatStore.getState())).toBe(2);
    });

    it('selectPinnedThreads returns only pinned', () => {
      act(() => {
        useChatStore.getState().createThread({
          title: 'Pinned',
          participants: ['user'],
          isPinned: true,
        });
        useChatStore.getState().createThread({
          title: 'Not Pinned',
          participants: ['user'],
          isPinned: false,
        });
      });
      const pinned = selectPinnedThreads(useChatStore.getState());
      expect(pinned).toHaveLength(1);
      expect(pinned[0].title).toBe('Pinned');
    });

    it('selectRecentThreads returns non-pinned sorted by lastMessageAt', () => {
      act(() => {
        useChatStore.getState().createThread({
          title: 'Pinned',
          participants: ['user'],
          isPinned: true,
        });
        useChatStore.getState().createThread({
          title: 'Recent',
          participants: ['user'],
          isPinned: false,
        });
      });
      const recent = selectRecentThreads(useChatStore.getState());
      expect(recent).toHaveLength(1);
      expect(recent[0].title).toBe('Recent');
    });

    it('selectTypingIndicators returns typing senders for thread', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'T',
          participants: ['user'],
          isPinned: false,
        });
        useChatStore.getState().setTyping(threadId, 'architect', true);
      });
      const typing = selectTypingIndicators(threadId)(useChatStore.getState());
      expect(typing).toContain('architect');
    });

    it('selectTypingIndicators returns empty array for unknown thread', () => {
      const typing = selectTypingIndicators('nonexistent')(useChatStore.getState());
      expect(typing).toHaveLength(0);
    });

    it('selectPendingApprovals returns unanswered approval messages', () => {
      let threadId = '';
      act(() => {
        threadId = useChatStore.getState().createThread({
          title: 'Approvals',
          participants: ['user', 'implementer'],
          isPinned: false,
        });
        useChatStore.getState().addMessage({
          threadId,
          content: 'Approve?',
          contentType: 'approval_request',
          sender: 'implementer',
          metadata: {
            actionType: 'commit',
            actionDescription: 'feat: new',
          },
        });
      });
      const pending = selectPendingApprovals(useChatStore.getState());
      expect(pending).toHaveLength(1);
    });
  });
});
