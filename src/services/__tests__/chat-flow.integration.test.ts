/**
 * Chat Flow Integration Tests
 *
 * Tests the end-to-end chat lifecycle: thread creation, message sending,
 * event emission, approval workflows, and search across threads.
 */

import { useChatStore } from '@thumbcode/state';
import { ChatService } from '../chat/ChatService';
import type { ChatEvent } from '../chat/types';

// Reset store before each test
beforeEach(() => {
  useChatStore.setState({
    threads: [],
    messages: {},
    activeThreadId: null,
    isTyping: {},
  });
});

describe('Chat Flow Integration', () => {
  describe('Full thread lifecycle', () => {
    it('creates thread, sends messages, and deletes thread', async () => {
      // Create
      const threadId = ChatService.createThread({
        title: 'Build Feature X',
        projectId: 'proj-1',
        participants: ['user', 'architect'],
      });
      expect(threadId).toBeDefined();

      // Send messages (use content that won't trigger multi-step pipeline detection)
      await ChatService.sendMessage({
        threadId,
        content: 'What colors should the login page use?',
      });
      await ChatService.sendMessage({
        threadId,
        content: 'Use OAuth for authentication',
      });

      const messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('What colors should the login page use?');
      expect(messages[1].content).toBe('Use OAuth for authentication');

      // Delete
      ChatService.deleteThread(threadId);
      expect(ChatService.getThreads()).toHaveLength(0);
    });

    it('pin/unpin thread persists across reads', () => {
      const threadId = ChatService.createThread({ title: 'Important Thread' });

      ChatService.pinThread(threadId, true);
      let thread = ChatService.getThread(threadId);
      expect(thread?.isPinned).toBe(true);

      ChatService.pinThread(threadId, false);
      thread = ChatService.getThread(threadId);
      expect(thread?.isPinned).toBe(false);
    });
  });

  describe('Multi-thread messaging', () => {
    it('isolates messages between threads', async () => {
      const thread1 = ChatService.createThread({ title: 'Thread 1' });
      const thread2 = ChatService.createThread({ title: 'Thread 2' });

      await ChatService.sendMessage({
        threadId: thread1,
        content: 'Message in thread 1',
      });
      await ChatService.sendMessage({
        threadId: thread2,
        content: 'Message in thread 2',
      });

      expect(ChatService.getMessages(thread1)).toHaveLength(1);
      expect(ChatService.getMessages(thread2)).toHaveLength(1);
      expect(ChatService.getMessages(thread1)[0].content).toBe('Message in thread 1');
      expect(ChatService.getMessages(thread2)[0].content).toBe('Message in thread 2');
    });

    it('clears messages from one thread without affecting others', async () => {
      const thread1 = ChatService.createThread({ title: 'Thread 1' });
      const thread2 = ChatService.createThread({ title: 'Thread 2' });

      await ChatService.sendMessage({
        threadId: thread1,
        content: 'Thread 1 message',
      });
      await ChatService.sendMessage({
        threadId: thread2,
        content: 'Thread 2 message',
      });

      ChatService.clearThread(thread1);

      expect(ChatService.getMessages(thread1)).toHaveLength(0);
      expect(ChatService.getMessages(thread2)).toHaveLength(1);
    });
  });

  describe('Event system integration', () => {
    it('emits message_complete events on send', async () => {
      const events: ChatEvent[] = [];
      const unsubscribe = ChatService.onEvent((event) => {
        events.push(event);
      });

      const threadId = ChatService.createThread({ title: 'Event Thread' });
      const messageId = await ChatService.sendMessage({
        threadId,
        content: 'Test event',
      });

      const messageEvents = events.filter(
        (e) => e.type === 'message_complete' && e.messageId === messageId
      );
      expect(messageEvents).toHaveLength(1);
      expect(messageEvents[0].sender).toBe('user');
      expect(messageEvents[0].threadId).toBe(threadId);

      unsubscribe();
    });

    it('stops emitting events after unsubscribe', async () => {
      const events: ChatEvent[] = [];
      const unsubscribe = ChatService.onEvent((event) => {
        events.push(event);
      });

      const threadId = ChatService.createThread({ title: 'Unsub Thread' });
      await ChatService.sendMessage({ threadId, content: 'Before unsub' });
      const countBefore = events.length;

      unsubscribe();

      await ChatService.sendMessage({ threadId, content: 'After unsub' });
      expect(events.length).toBe(countBefore);
    });

    it('multiple listeners receive same events', async () => {
      const events1: string[] = [];
      const events2: string[] = [];

      const unsub1 = ChatService.onEvent((e) => events1.push(e.type));
      const unsub2 = ChatService.onEvent((e) => events2.push(e.type));

      const threadId = ChatService.createThread({ title: 'Multi-listener' });
      await ChatService.sendMessage({ threadId, content: 'Hello' });

      expect(events1).toContain('message_complete');
      expect(events2).toContain('message_complete');
      expect(events1.length).toBe(events2.length);

      unsub1();
      unsub2();
    });
  });

  describe('Approval workflow integration', () => {
    it('request and approve flow', () => {
      const events: ChatEvent[] = [];
      const unsubscribe = ChatService.onEvent((e) => events.push(e));

      const threadId = ChatService.createThread({ title: 'Approval Thread' });

      // Request approval
      const approvalId = ChatService.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'commit',
        actionDescription: 'Commit login feature to main branch',
      });

      // Verify approval request message
      let messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].contentType).toBe('approval_request');
      expect(messages[0].metadata?.actionType).toBe('commit');
      expect(messages[0].sender).toBe('implementer');

      // Respond with approval
      ChatService.respondToApproval(threadId, approvalId, true);

      messages = ChatService.getMessages(threadId);
      expect(messages[0].metadata?.approved).toBe(true);
      expect(messages[0].metadata?.respondedAt).toBeDefined();

      // Verify events
      const approvalEvents = events.filter(
        (e) => e.type === 'approval_request' || e.type === 'approval_response'
      );
      expect(approvalEvents).toHaveLength(2);

      unsubscribe();
    });

    it('request and deny flow', () => {
      const threadId = ChatService.createThread({ title: 'Deny Thread' });

      const approvalId = ChatService.requestApproval({
        threadId,
        sender: 'architect',
        actionType: 'push',
        actionDescription: 'Push architecture changes to remote',
      });

      ChatService.respondToApproval(threadId, approvalId, false);

      const messages = ChatService.getMessages(threadId);
      expect(messages[0].metadata?.approved).toBe(false);
    });

    it('handles multiple approval requests in one thread', () => {
      const threadId = ChatService.createThread({
        title: 'Multi-approval Thread',
      });

      const approval1 = ChatService.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'commit',
        actionDescription: 'Commit feature A',
      });

      const approval2 = ChatService.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'push',
        actionDescription: 'Push feature A to remote',
      });

      ChatService.respondToApproval(threadId, approval1, true);
      ChatService.respondToApproval(threadId, approval2, false);

      const messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(2);
      expect(messages[0].metadata?.approved).toBe(true);
      expect(messages[1].metadata?.approved).toBe(false);
    });
  });

  describe('Code message flow', () => {
    it('sends and retrieves code messages with metadata', async () => {
      const threadId = ChatService.createThread({ title: 'Code Thread' });

      await ChatService.sendCodeMessage({
        threadId,
        code: 'function hello() { return "world"; }',
        language: 'typescript',
        filename: 'hello.ts',
      });

      const messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].contentType).toBe('code');
      expect(messages[0].content).toBe('function hello() { return "world"; }');
      expect(messages[0].metadata?.language).toBe('typescript');
      expect(messages[0].metadata?.filename).toBe('hello.ts');
    });
  });

  describe('Search integration', () => {
    it('searches across all threads case-insensitively', async () => {
      const thread1 = ChatService.createThread({ title: 'Thread A' });
      const thread2 = ChatService.createThread({ title: 'Thread B' });

      await ChatService.sendMessage({
        threadId: thread1,
        content: 'Implement the login page',
      });
      await ChatService.sendMessage({
        threadId: thread1,
        content: 'Add validation logic',
      });
      await ChatService.sendMessage({
        threadId: thread2,
        content: 'LOGIN endpoint is ready',
      });
      await ChatService.sendMessage({
        threadId: thread2,
        content: 'Deploy to staging',
      });

      const results = ChatService.searchMessages('login');
      expect(results).toHaveLength(2);
      expect(results.every((m) => m.content.toLowerCase().includes('login'))).toBe(true);
    });

    it('returns results sorted by timestamp descending', async () => {
      const threadId = ChatService.createThread({ title: 'Sort Thread' });

      await ChatService.sendMessage({
        threadId,
        content: 'First match message',
      });
      // Small delay so timestamps differ
      await new Promise((r) => setTimeout(r, 10));
      await ChatService.sendMessage({
        threadId,
        content: 'Second match message',
      });

      const results = ChatService.searchMessages('match');
      expect(results).toHaveLength(2);
      // Most recent should be first
      const ts0 = new Date(results[0].timestamp).getTime();
      const ts1 = new Date(results[1].timestamp).getTime();
      expect(ts0).toBeGreaterThanOrEqual(ts1);
    });

    it('returns empty for no matches', async () => {
      const threadId = ChatService.createThread({ title: 'Empty Search' });
      await ChatService.sendMessage({ threadId, content: 'Some message' });

      const results = ChatService.searchMessages('nonexistent-term');
      expect(results).toHaveLength(0);
    });
  });

  describe('Mark as read', () => {
    it('resets unread count after marking as read', async () => {
      const threadId = ChatService.createThread({ title: 'Unread Thread' });

      await ChatService.sendMessage({ threadId, content: 'Message 1' });
      await ChatService.sendMessage({ threadId, content: 'Message 2' });
      await ChatService.sendMessage({ threadId, content: 'Message 3' });

      ChatService.markAsRead(threadId);

      const thread = ChatService.getThread(threadId);
      expect(thread?.unreadCount).toBe(0);
    });
  });

  describe('Response cancellation', () => {
    it('cancelResponse does not throw when no active response', () => {
      const threadId = ChatService.createThread({ title: 'Cancel Thread' });
      // Should not throw
      expect(() => ChatService.cancelResponse(threadId)).not.toThrow();
    });
  });
});
