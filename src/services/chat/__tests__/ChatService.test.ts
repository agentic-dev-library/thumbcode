/**
 * Chat Service Tests
 */

import { useChatStore } from '@thumbcode/state';
import { ChatService } from '../ChatService';

// Reset store before each test
beforeEach(() => {
  useChatStore.setState({
    threads: [],
    messages: {},
    activeThreadId: null,
    isTyping: {},
  });
});

describe('ChatService', () => {
  describe('Thread Management', () => {
    it('should create a new thread', () => {
      const threadId = ChatService.createThread({
        title: 'Test Thread',
        projectId: 'project-1',
      });

      expect(threadId).toBeDefined();
      expect(typeof threadId).toBe('string');

      const thread = ChatService.getThread(threadId);
      expect(thread).toBeDefined();
      expect(thread?.title).toBe('Test Thread');
      expect(thread?.projectId).toBe('project-1');
    });

    it('should get all threads', () => {
      ChatService.createThread({ title: 'Thread 1' });
      ChatService.createThread({ title: 'Thread 2' });

      const threads = ChatService.getThreads();
      expect(threads).toHaveLength(2);
    });

    it('should delete a thread', () => {
      const threadId = ChatService.createThread({ title: 'Thread to delete' });
      expect(ChatService.getThreads()).toHaveLength(1);

      ChatService.deleteThread(threadId);
      expect(ChatService.getThreads()).toHaveLength(0);
    });

    it('should pin and unpin a thread', () => {
      const threadId = ChatService.createThread({ title: 'Test Thread' });

      ChatService.pinThread(threadId, true);
      expect(ChatService.getThread(threadId)?.isPinned).toBe(true);

      ChatService.pinThread(threadId, false);
      expect(ChatService.getThread(threadId)?.isPinned).toBe(false);
    });
  });

  describe('Message Management', () => {
    let threadId: string;

    beforeEach(() => {
      threadId = ChatService.createThread({ title: 'Test Thread' });
    });

    it('should send a text message', async () => {
      const messageId = await ChatService.sendMessage({
        threadId,
        content: 'Hello, world!',
      });

      expect(messageId).toBeDefined();

      const messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Hello, world!');
      expect(messages[0].sender).toBe('user');
      expect(messages[0].contentType).toBe('text');
    });

    it('should send a code message', async () => {
      const messageId = await ChatService.sendCodeMessage({
        threadId,
        code: 'console.log("Hello");',
        language: 'javascript',
        filename: 'hello.js',
      });

      expect(messageId).toBeDefined();

      const messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('console.log("Hello");');
      expect(messages[0].contentType).toBe('code');
      expect(messages[0].metadata?.language).toBe('javascript');
      expect(messages[0].metadata?.filename).toBe('hello.js');
    });

    it('should clear thread messages', async () => {
      await ChatService.sendMessage({ threadId, content: 'Message 1' });
      await ChatService.sendMessage({ threadId, content: 'Message 2' });
      expect(ChatService.getMessages(threadId)).toHaveLength(2);

      ChatService.clearThread(threadId);
      expect(ChatService.getMessages(threadId)).toHaveLength(0);
    });
  });

  describe('Approval Workflow', () => {
    let threadId: string;

    beforeEach(() => {
      threadId = ChatService.createThread({ title: 'Test Thread' });
    });

    it('should request approval', () => {
      const messageId = ChatService.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'commit',
        actionDescription: 'Commit changes to feature branch',
      });

      expect(messageId).toBeDefined();

      const messages = ChatService.getMessages(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].contentType).toBe('approval_request');
      expect(messages[0].metadata?.actionType).toBe('commit');
    });

    it('should respond to approval', () => {
      const messageId = ChatService.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'push',
        actionDescription: 'Push changes to remote',
      });

      ChatService.respondToApproval(threadId, messageId, true);

      const messages = ChatService.getMessages(threadId);
      expect(messages[0].metadata?.approved).toBe(true);
      expect(messages[0].metadata?.respondedAt).toBeDefined();
    });
  });

  describe('Search', () => {
    it('should search messages across threads', async () => {
      const thread1 = ChatService.createThread({ title: 'Thread 1' });
      const thread2 = ChatService.createThread({ title: 'Thread 2' });

      await ChatService.sendMessage({ threadId: thread1, content: 'Hello world' });
      await ChatService.sendMessage({ threadId: thread1, content: 'Goodbye world' });
      await ChatService.sendMessage({ threadId: thread2, content: 'Hello there' });
      await ChatService.sendMessage({ threadId: thread2, content: 'Something else' });

      const results = ChatService.searchMessages('Hello');
      expect(results).toHaveLength(2);
      expect(results.every((m) => m.content.toLowerCase().includes('hello'))).toBe(true);
    });

    it('should return empty results for no matches', async () => {
      const threadId = ChatService.createThread({ title: 'Test Thread' });
      await ChatService.sendMessage({ threadId, content: 'Test message' });

      const results = ChatService.searchMessages('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('Event System', () => {
    it('should emit events on message send', async () => {
      const events: string[] = [];
      const unsubscribe = ChatService.onEvent((event) => {
        events.push(event.type);
      });

      const threadId = ChatService.createThread({ title: 'Test Thread' });
      await ChatService.sendMessage({ threadId, content: 'Test' });

      expect(events).toContain('message_complete');

      unsubscribe();
    });

    it('should emit events on approval request', () => {
      const events: string[] = [];
      const unsubscribe = ChatService.onEvent((event) => {
        events.push(event.type);
      });

      const threadId = ChatService.createThread({ title: 'Test Thread' });
      ChatService.requestApproval({
        threadId,
        sender: 'implementer',
        actionType: 'commit',
        actionDescription: 'Test commit',
      });

      expect(events).toContain('approval_request');

      unsubscribe();
    });

    it('should unsubscribe from events', async () => {
      const events: string[] = [];
      const unsubscribe = ChatService.onEvent((event) => {
        events.push(event.type);
      });

      const threadId = ChatService.createThread({ title: 'Test Thread' });
      await ChatService.sendMessage({ threadId, content: 'Message 1' });
      expect(events.length).toBeGreaterThan(0);

      const eventCountBefore = events.length;
      unsubscribe();

      await ChatService.sendMessage({ threadId, content: 'Message 2' });
      expect(events.length).toBe(eventCountBefore); // No new events after unsubscribe
    });
  });

  describe('Mark as Read', () => {
    it('should mark thread as read', async () => {
      const threadId = ChatService.createThread({ title: 'Test Thread' });

      // Add messages to increase unread count
      await ChatService.sendMessage({ threadId, content: 'Message 1' });
      await ChatService.sendMessage({ threadId, content: 'Message 2' });

      // Mark as read
      ChatService.markAsRead(threadId);

      const thread = ChatService.getThread(threadId);
      expect(thread?.unreadCount).toBe(0);
    });
  });
});
