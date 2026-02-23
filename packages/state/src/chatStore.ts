/**
 * Chat Store
 *
 * Manages chat threads and messages for human-agent collaboration.
 * Supports multiple conversation threads with different agents.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Stable empty arrays to prevent infinite re-renders from ?? [] creating new references
const EMPTY_MESSAGES: Message[] = [];
const EMPTY_STRINGS: string[] = [];

// Message sender types
export type MessageSender = 'user' | 'architect' | 'implementer' | 'reviewer' | 'tester' | 'system';

// Message status for delivery tracking
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';

// Message content types
export type MessageContentType =
  | 'text'
  | 'code'
  | 'diff'
  | 'file_reference'
  | 'approval_request'
  | 'image'
  | 'mixed_media'
  | 'voice_transcript'
  | 'document';

// Media attachment for multimedia messages
export interface MediaAttachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  uri: string;
  mimeType: string;
  filename?: string;
  size?: number;
  thumbnail?: string;
}

// Base message interface
export interface Message {
  id: string;
  threadId: string;
  sender: MessageSender;
  senderName?: string;
  content: string;
  contentType: MessageContentType;
  status: MessageStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
  attachments?: MediaAttachment[];
}

// Code message with language highlighting
export interface CodeMessage extends Message {
  contentType: 'code';
  metadata: {
    language: string;
    filename?: string;
  };
}

// Approval request from agents
export interface ApprovalMessage extends Message {
  contentType: 'approval_request';
  metadata: {
    actionType: 'commit' | 'push' | 'merge' | 'deploy' | 'file_change';
    actionDescription: string;
    approved?: boolean;
    respondedAt?: string;
  };
}

// Image message with dimensions and caption
export interface ImageMessage extends Message {
  contentType: 'image';
  metadata: {
    imageUrl: string;
    width?: number;
    height?: number;
    caption?: string;
  };
}

// Document message with file metadata
export interface DocumentMessage extends Message {
  contentType: 'document';
  metadata: {
    filename: string;
    mimeType: string;
    size: number;
  };
}

// Voice transcript message
export interface VoiceMessage extends Message {
  contentType: 'voice_transcript';
  metadata: {
    audioUrl?: string;
    duration?: number;
  };
}

// Chat thread for organizing conversations
export interface ChatThread {
  id: string;
  title: string;
  projectId?: string;
  participants: MessageSender[];
  lastMessageAt: string;
  createdAt: string;
  unreadCount: number;
  isPinned: boolean;
}

interface ChatState {
  // State
  threads: ChatThread[];
  messages: Record<string, Message[]>; // threadId -> messages
  activeThreadId: string | null;
  isTyping: Record<string, MessageSender[]>; // threadId -> typing senders

  // Thread actions
  createThread: (
    thread: Omit<ChatThread, 'id' | 'createdAt' | 'lastMessageAt' | 'unreadCount'>
  ) => string;
  deleteThread: (threadId: string) => void;
  setActiveThread: (threadId: string | null) => void;
  updateThread: (threadId: string, updates: Partial<ChatThread>) => void;
  pinThread: (threadId: string, pinned: boolean) => void;
  markThreadAsRead: (threadId: string) => void;

  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => string;
  updateMessageContent: (messageId: string, threadId: string, content: string) => void;
  updateMessageStatus: (messageId: string, threadId: string, status: MessageStatus) => void;
  deleteMessage: (messageId: string, threadId: string) => void;

  // Approval actions
  respondToApproval: (messageId: string, threadId: string, approved: boolean) => void;

  // Typing indicator actions
  setTyping: (threadId: string, sender: MessageSender, isTyping: boolean) => void;

  // Bulk operations
  clearThread: (threadId: string) => void;
  clearAllThreads: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      immer((set) => ({
        threads: [],
        messages: {},
        activeThreadId: null,
        isTyping: {},

        createThread: (thread) => {
          const threadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          const now = new Date().toISOString();
          set((state) => {
            state.threads.push({
              ...thread,
              id: threadId,
              createdAt: now,
              lastMessageAt: now,
              unreadCount: 0,
            });
            state.messages[threadId] = [];
          });
          return threadId;
        },

        deleteThread: (threadId) =>
          set((state) => {
            state.threads = state.threads.filter((t) => t.id !== threadId);
            delete state.messages[threadId];
            delete state.isTyping[threadId];
            if (state.activeThreadId === threadId) {
              state.activeThreadId = null;
            }
          }),

        setActiveThread: (threadId) =>
          set((state) => {
            state.activeThreadId = threadId;
            if (threadId) {
              const thread = state.threads.find((t) => t.id === threadId);
              if (thread) {
                thread.unreadCount = 0;
              }
            }
          }),

        updateThread: (threadId, updates) =>
          set((state) => {
            const thread = state.threads.find((t) => t.id === threadId);
            if (thread) {
              Object.assign(thread, updates);
            }
          }),

        pinThread: (threadId, pinned) =>
          set((state) => {
            const thread = state.threads.find((t) => t.id === threadId);
            if (thread) {
              thread.isPinned = pinned;
            }
          }),

        markThreadAsRead: (threadId) =>
          set((state) => {
            const thread = state.threads.find((t) => t.id === threadId);
            if (thread) {
              thread.unreadCount = 0;
            }
          }),

        addMessage: (message) => {
          const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          set((state) => {
            const fullMessage: Message = {
              ...message,
              id: messageId,
              timestamp: new Date().toISOString(),
              status: 'sending',
            };

            // Initialize messages array if needed
            if (!state.messages[message.threadId]) {
              state.messages[message.threadId] = [];
            }
            state.messages[message.threadId].push(fullMessage);

            // Update thread
            const thread = state.threads.find((t) => t.id === message.threadId);
            if (thread) {
              thread.lastMessageAt = fullMessage.timestamp;
              // Increment unread if not active thread and message is from agent
              if (state.activeThreadId !== message.threadId && message.sender !== 'user') {
                thread.unreadCount += 1;
              }
            }
          });
          return messageId;
        },

        updateMessageContent: (messageId, threadId, content) =>
          set((state) => {
            const threadMessages = state.messages[threadId];
            if (threadMessages) {
              const message = threadMessages.find((m) => m.id === messageId);
              if (message) {
                message.content = content;
              }
            }
          }),

        updateMessageStatus: (messageId, threadId, status) =>
          set((state) => {
            const threadMessages = state.messages[threadId];
            if (threadMessages) {
              const message = threadMessages.find((m) => m.id === messageId);
              if (message) {
                message.status = status;
              }
            }
          }),

        deleteMessage: (messageId, threadId) =>
          set((state) => {
            if (state.messages[threadId]) {
              state.messages[threadId] = state.messages[threadId].filter((m) => m.id !== messageId);
            }
          }),

        respondToApproval: (messageId, threadId, approved) =>
          set((state) => {
            const threadMessages = state.messages[threadId];
            if (threadMessages) {
              const message = threadMessages.find((m) => m.id === messageId) as
                | ApprovalMessage
                | undefined;
              if (message?.contentType === 'approval_request' && message.metadata) {
                message.metadata.approved = approved;
                message.metadata.respondedAt = new Date().toISOString();
              }
            }
          }),

        setTyping: (threadId, sender, isTypingNow) =>
          set((state) => {
            if (!state.isTyping[threadId]) {
              state.isTyping[threadId] = [];
            }
            if (isTypingNow && !state.isTyping[threadId].includes(sender)) {
              state.isTyping[threadId].push(sender);
            } else if (!isTypingNow) {
              state.isTyping[threadId] = state.isTyping[threadId].filter((s) => s !== sender);
            }
          }),

        clearThread: (threadId) =>
          set((state) => {
            state.messages[threadId] = [];
          }),

        clearAllThreads: () =>
          set((state) => {
            state.threads = [];
            state.messages = {};
            state.activeThreadId = null;
            state.isTyping = {};
          }),
      })),
      {
        name: 'thumbcode-chat-storage',
        // Limit persisted messages to prevent storage bloat
        partialize: (state) => ({
          threads: state.threads,
          // Only persist last 100 messages per thread
          messages: Object.fromEntries(
            Object.entries(state.messages).map(([threadId, msgs]) => [threadId, msgs.slice(-100)])
          ),
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);

// Selectors for optimal re-renders
export const selectThreads = (state: ChatState) => state.threads;
export const selectActiveThread = (state: ChatState) =>
  state.threads.find((t) => t.id === state.activeThreadId) ?? null;
export const selectActiveThreadMessages = (state: ChatState) =>
  state.activeThreadId ? (state.messages[state.activeThreadId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES;
export const selectThreadMessages = (threadId: string) => (state: ChatState) =>
  state.messages[threadId] ?? EMPTY_MESSAGES;
export const selectUnreadCount = (state: ChatState) =>
  state.threads.reduce((sum, t) => sum + t.unreadCount, 0);
export const selectPinnedThreads = (state: ChatState) => state.threads.filter((t) => t.isPinned);
export const selectRecentThreads = (state: ChatState) =>
  [...state.threads]
    .filter((t) => !t.isPinned)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
export const selectTypingIndicators = (threadId: string) => (state: ChatState) =>
  state.isTyping[threadId] ?? EMPTY_STRINGS;
export const selectPendingApprovals = (state: ChatState) =>
  Object.values(state.messages)
    .flat()
    .filter(
      (m): m is ApprovalMessage =>
        m.contentType === 'approval_request' && m.metadata?.approved === undefined
    );
