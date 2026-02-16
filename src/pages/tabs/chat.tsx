/**
 * Chat Screen
 *
 * Main chat interface for human-agent communication.
 * Migrated from React Native to web React with Tailwind CSS.
 */

import {
  type ApprovalMessage,
  type ChatThread,
  type Message,
  selectPinnedThreads,
  selectRecentThreads,
  useChatStore,
  useProjectStore,
  useUserStore,
} from '@thumbcode/state';
import { ChevronLeft, MessageSquarePlus, Pin, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatService } from '@/services/chat';

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getSenderInfo(sender: Message['sender']) {
  const senderMap: Record<Message['sender'], { name: string; bgColor: string; textColor: string }> =
    {
      user: { name: 'You', bgColor: 'bg-teal-600', textColor: 'text-white' },
      architect: { name: 'Architect', bgColor: 'bg-coral-500', textColor: 'text-white' },
      implementer: { name: 'Implementer', bgColor: 'bg-gold-500', textColor: 'text-charcoal' },
      reviewer: { name: 'Reviewer', bgColor: 'bg-teal-500', textColor: 'text-white' },
      tester: { name: 'Tester', bgColor: 'bg-neutral-600', textColor: 'text-white' },
      system: { name: 'System', bgColor: 'bg-neutral-700', textColor: 'text-neutral-300' },
    };
  return senderMap[sender] || senderMap.system;
}

function getParticipantColor(participant: string): string {
  const colorMap: Record<string, string> = {
    architect: 'bg-coral-500',
    implementer: 'bg-gold-500',
    reviewer: 'bg-teal-500',
    tester: 'bg-neutral-500',
  };
  return colorMap[participant] || 'bg-neutral-600';
}

/* ------------------------------------------------------------------ */
/*  Sub-components: Thread list                                        */
/* ------------------------------------------------------------------ */

interface ThreadItemProps {
  thread: ChatThread;
  onSelect: () => void;
}

function ThreadItem({ thread, onSelect }: Readonly<ThreadItemProps>) {
  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full bg-surface-elevated p-4 mb-2 rounded-organic-card shadow-organic-card hover:bg-neutral-700 transition-colors text-left"
      style={{ transform: 'rotate(-0.2deg)' }}
      aria-label={`${thread.title}${hasUnread ? `, ${thread.unreadCount} unread` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-3">
          {/* Title */}
          <div className="flex items-center mb-1">
            {thread.isPinned && (
              <span className="mr-2 text-xs font-body font-medium text-gold-400 bg-gold-500/20 px-1.5 py-0.5 rounded-organic-badge">
                Pinned
              </span>
            )}
            <span
              className={`font-display text-base truncate ${hasUnread ? 'text-white' : 'text-neutral-200'}`}
            >
              {thread.title}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center mb-1">
            {thread.participants
              .filter((p) => p !== 'user')
              .slice(0, 3)
              .map((participant, index) => (
                <div
                  key={participant}
                  className={`w-2 h-2 rounded-full ${getParticipantColor(participant)} ${index > 0 ? 'ml-1' : ''}`}
                  aria-hidden="true"
                  title={participant}
                />
              ))}
            {thread.participants.length > 4 && (
              <span className="text-xs font-body text-neutral-500 ml-1">
                +{thread.participants.length - 4}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs font-body text-neutral-500">
            {formatRelativeTime(thread.lastMessageAt)}
          </span>
        </div>

        {/* Unread badge */}
        {hasUnread && (
          <span className="bg-coral-500 text-white text-xs font-body font-semibold px-2 py-0.5 min-w-[20px] text-center rounded-organic-input">
            {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

interface ThreadListViewProps {
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
}

function ThreadListView({ onSelectThread, onCreateThread }: Readonly<ThreadListViewProps>) {
  const pinnedThreads = useChatStore(selectPinnedThreads);
  const recentThreads = useChatStore(selectRecentThreads);
  const allThreads = [...pinnedThreads, ...recentThreads];

  if (allThreads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="font-display text-lg text-neutral-400 text-center mb-2">
          No conversations yet
        </h2>
        <p className="text-sm font-body text-neutral-500 text-center mb-4">
          Start a new thread to collaborate with AI agents
        </p>
        <button
          type="button"
          onClick={onCreateThread}
          className="bg-coral-500 px-6 py-3 font-body font-semibold text-white rounded-organic-button hover:bg-coral-600 transition-colors"
        >
          New Thread
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-700">
        <h2 className="font-display text-lg text-white">Conversations</h2>
        <button
          type="button"
          onClick={onCreateThread}
          className="bg-teal-600 px-3 py-1.5 rounded-organic-button hover:bg-teal-700 transition-colors flex items-center gap-1"
        >
          <MessageSquarePlus size={14} className="text-white" />
          <span className="text-sm font-body font-semibold text-white">New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Pinned */}
        {pinnedThreads.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1 px-4 py-2">
              <Pin size={10} className="text-neutral-500" />
              <span className="text-xs font-body text-neutral-500 uppercase tracking-wider">
                Pinned
              </span>
            </div>
            {pinnedThreads.map((thread) => (
              <div key={thread.id} className="px-3">
                <ThreadItem thread={thread} onSelect={() => onSelectThread(thread.id)} />
              </div>
            ))}
          </div>
        )}

        {/* Recent */}
        {recentThreads.length > 0 && (
          <div>
            <span className="block text-xs font-body text-neutral-500 uppercase tracking-wider px-4 py-2">
              Recent
            </span>
            {recentThreads.map((thread) => (
              <div key={thread.id} className="px-3">
                <ThreadItem thread={thread} onSelect={() => onSelectThread(thread.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components: Chat message                                       */
/* ------------------------------------------------------------------ */

interface ChatMessageViewProps {
  message: Message;
  onApprovalResponse?: (messageId: string, approved: boolean) => void;
}

function ChatMessageView({ message, onApprovalResponse }: Readonly<ChatMessageViewProps>) {
  const isUser = message.sender === 'user';
  const senderInfo = getSenderInfo(message.sender);

  // Approval request
  if (message.contentType === 'approval_request') {
    const approvalMsg = message as ApprovalMessage;
    return (
      <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[90%]">
          <div className="bg-gold-500/10 border border-gold-500/20 p-4 rounded-organic-card">
            <span className="block text-sm font-body font-semibold text-gold-400 mb-1">
              Approval Required
            </span>
            <p className="text-sm font-body text-neutral-300 mb-3">
              {approvalMsg.metadata.actionDescription}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApprovalResponse?.(message.id, true)}
                className="px-3 py-1.5 bg-teal-600 text-white text-sm font-body font-semibold rounded-organic-button hover:bg-teal-700 transition-colors"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onApprovalResponse?.(message.id, false)}
                className="px-3 py-1.5 bg-coral-500 text-white text-sm font-body font-semibold rounded-organic-button hover:bg-coral-600 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
          <span className="text-xs font-body text-neutral-500 mt-1 mx-2">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Code message
  if (message.contentType === 'code') {
    return (
      <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[90%]">
          <div className="flex items-center mb-1">
            <span
              className={`px-2 py-0.5 text-xs font-body rounded-organic-input ${senderInfo.bgColor} ${senderInfo.textColor}`}
            >
              {senderInfo.name}
            </span>
          </div>
          <pre className="bg-neutral-900 p-3 rounded-organic-card overflow-x-auto">
            <code className="text-sm font-mono text-neutral-200">{message.content}</code>
          </pre>
          <span className="text-xs font-body text-neutral-500 mt-1 block">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Text message
  const bubbleRadius = isUser
    ? 'rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-xl'
    : 'rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-xl';

  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        {!isUser && (
          <div className="flex items-center mb-1">
            <span
              className={`px-2 py-0.5 text-xs font-body rounded-organic-input ${senderInfo.bgColor} ${senderInfo.textColor}`}
            >
              {senderInfo.name}
            </span>
          </div>
        )}
        <div className={`p-3 ${isUser ? 'bg-teal-600' : 'bg-surface-elevated'} ${bubbleRadius}`}>
          <p className={`font-body ${isUser ? 'text-white' : 'text-neutral-200'}`}>
            {message.content}
          </p>
        </div>
        <div className={`flex items-center mt-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-xs font-body text-neutral-500">
            {formatTime(message.timestamp)}
          </span>
          {message.status === 'sending' && (
            <span className="text-xs font-body text-neutral-500 ml-1">&bull; Sending...</span>
          )}
          {message.status === 'failed' && (
            <span className="text-xs font-body text-coral-400 ml-1">&bull; Failed</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components: Chat input                                         */
/* ------------------------------------------------------------------ */

interface ChatInputBarProps {
  threadId: string;
}

function ChatInputBar({ threadId }: Readonly<ChatInputBarProps>) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    setIsSending(true);
    setText('');

    try {
      await ChatService.sendMessage({
        threadId,
        content: trimmedText,
      });
    } catch (error) {
      console.error('[ChatInput] Failed to send message:', error);
      setText(trimmedText);
    } finally {
      setIsSending(false);
    }
  }, [text, threadId, isSending]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <div className="flex items-end p-3 border-t border-neutral-700 bg-surface">
      <textarea
        aria-label="Message input"
        className="flex-1 bg-neutral-800 text-white font-body px-4 py-3 mr-2 rounded-organic-input resize-none outline-none placeholder-neutral-400"
        style={{ minHeight: 44, maxHeight: 120 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        rows={1}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className={`px-4 py-3 rounded-organic-button transition-colors flex items-center gap-1 ${
          canSend
            ? 'bg-coral-500 hover:bg-coral-600 text-white'
            : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
        }`}
        aria-label="Send"
      >
        <Send size={16} />
        <span className="font-body font-semibold text-sm">{isSending ? '...' : 'Send'}</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main chat page                                                     */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const respondToApproval = useChatStore((s) => s.respondToApproval);

  const _projects = useProjectStore((s) => s.projects);
  const _userProfile = useUserStore((s) => s.githubProfile);

  const activeThread = useChatStore((s) =>
    activeThreadId ? s.threads.find((t) => t.id === activeThreadId) : undefined
  );
  const activeThreadTitle = activeThread?.title;

  const messages = useChatStore((s) => (activeThreadId ? (s.messages[activeThreadId] ?? []) : []));
  const typingSenders = useChatStore((s) =>
    activeThreadId ? (s.isTyping[activeThreadId] ?? []) : []
  );

  const typingLabel = useMemo(() => {
    const nonUser = typingSenders.filter((s) => s !== 'user');
    if (nonUser.length === 0) return null;
    if (nonUser.length === 1) return `${nonUser[0]} is typing\u2026`;
    return `${nonUser.slice(0, 2).join(', ')} are typing\u2026`;
  }, [typingSenders]);

  useEffect(() => {
    if (!activeThreadId) return;
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [activeThreadId]);

  const handleCreateThread = useCallback(() => {
    const id = ChatService.createThread({
      title: 'New thread',
      participants: ['user', 'architect', 'implementer', 'reviewer', 'tester'],
    });
    setActiveThread(id);
  }, [setActiveThread]);

  const handleApprovalResponse = useCallback(
    (messageId: string, approved: boolean) => {
      if (!activeThreadId) return;
      respondToApproval(messageId, activeThreadId, approved);
    },
    [activeThreadId, respondToApproval]
  );

  return (
    <div className="flex-1 flex flex-col bg-charcoal overflow-hidden" data-testid="chat-screen">
      {!activeThreadId ? (
        <ThreadListView onSelectThread={setActiveThread} onCreateThread={handleCreateThread} />
      ) : (
        <>
          {/* Thread header */}
          <div className="flex items-center px-4 py-3 border-b border-neutral-800 bg-charcoal">
            <button
              type="button"
              onClick={() => setActiveThread(null)}
              className="mr-3 p-2 -ml-2 hover:bg-neutral-800 rounded-organic-button transition-colors"
              aria-label="Back to thread list"
            >
              <ChevronLeft size={18} className="text-neutral-400" />
            </button>
            <h2 className="font-display text-lg text-white flex-1 truncate">
              {activeThreadTitle || 'Chat'}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3">
            {messages.map((msg) => (
              <ChatMessageView
                key={msg.id}
                message={msg}
                onApprovalResponse={handleApprovalResponse}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingLabel && (
            <output className="px-4 py-2 block" aria-live="polite">
              <span className="text-sm font-body text-neutral-500">{typingLabel}</span>
            </output>
          )}

          {/* Input */}
          <ChatInputBar threadId={activeThreadId} />
        </>
      )}
    </div>
  );
}
