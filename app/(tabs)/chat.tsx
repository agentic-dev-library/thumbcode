/**
 * Chat Screen
 *
 * Main chat interface for human-agent communication.
 * Uses paint daube icons for brand consistency.
 */

import { GitCommitService } from '@thumbcode/core';
import {
  type ApprovalMessage,
  type Message,
  useChatStore,
  useProjectStore,
  useUserStore,
} from '@thumbcode/state';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ChatInput, ChatMessage, ThreadList } from '@/components/chat';
import { ChevronDownIcon } from '@/components/icons';
import { Text } from '@/components/ui';
import { ChatService } from '@/services/chat';

export default function ChatScreen() {
  const listRef = useRef<HTMLDivElement>(null);

  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const setActiveThread = useChatStore((s) => s.setActiveThread);
  const respondToApproval = useChatStore((s) => s.respondToApproval);

  const projects = useProjectStore((s) => s.projects);
  const userProfile = useUserStore((s) => s.githubProfile);

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
    if (nonUser.length === 1) return `${nonUser[0]} is typing…`;
    return `${nonUser.slice(0, 2).join(', ')} are typing…`;
  }, [typingSenders]);

  useEffect(() => {
    if (!activeThreadId) return;
    // Slight delay so list has laid out before scrolling to end
    const timer = setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeThreadId]);

  const handleCreateThread = () => {
    const id = ChatService.createThread({
      title: 'New thread',
      participants: ['user', 'architect', 'implementer', 'reviewer', 'tester'],
    });
    setActiveThread(id);
  };

  const performCommit = useCallback(
    async (approvalMsg: ApprovalMessage) => {
      const projectId = activeThread?.projectId;
      const project = projectId ? projects.find((p) => p.id === projectId) : undefined;
      const repoDir = project?.localPath;

      if (!repoDir) {
        window.alert('Error', 'No repository path found for project');
        return false;
      }

      await GitCommitService.stage({ dir: repoDir, filepath: '.' });

      const author = {
        name: userProfile?.name || userProfile?.login || 'User',
        email: userProfile?.email || 'user@example.com',
      };

      await GitCommitService.commit({
        dir: repoDir,
        message: approvalMsg.metadata.actionDescription || 'Commit from chat',
        author,
      });

      return true;
    },
    [activeThread, projects, userProfile]
  );

  const handleApprovalResponse = useCallback(
    async (messageId: string, approved: boolean) => {
      if (!activeThreadId) return;

      const message = messages.find((m) => m.id === messageId);
      const isCommitApproval =
        approved &&
        message?.contentType === 'approval_request' &&
        (message as ApprovalMessage).metadata.actionType === 'commit';

      if (isCommitApproval) {
        try {
          const committed = await performCommit(message as ApprovalMessage);
          if (committed) {
            respondToApproval(messageId, activeThreadId, approved);
          }
        } catch (error) {
          console.error('Failed to commit:', error);
          window.alert('Commit Failed', error instanceof Error ? error.message : 'Unknown error');
        }
        return;
      }

      respondToApproval(messageId, activeThreadId, approved);
    },
    [activeThreadId, messages, performCommit, respondToApproval]
  );

  return (
    <div className="flex-1 bg-charcoal">
      {!activeThreadId ? (
        <div className="flex-1" >
          <ThreadList onSelectThread={setActiveThread} onCreateThread={handleCreateThread} />
        </div>
      ) : (
        <div className="flex-1" >
          {/* Thread header */}
          <div className="flex-row items-center px-4 py-3 border-b border-neutral-800 bg-charcoal">
            <button type="button"
              onClick={() => setActiveThread(null)}
              role="button"
              aria-label="Back"
              aria-description="Return to thread list"
              className="mr-3 p-2 -ml-2"
            >
              <div style={{ transform: 'rotate(90deg)' }}>
                <ChevronDownIcon size={18} color="warmGray" turbulence={0.12} />
              </div>
            </button>
            <Text variant="display" size="lg" className="text-white flex-1" numberOfLines={1}>
              {activeThreadTitle || 'Chat'}
            </Text>
          </div>

          {/* Messages */}
          <div ref={listRef} style={{ overflowY: 'auto', flex: 1 }}>
            {messages.map((item) => (
              <ChatMessage key={item.id} message={item} onApprovalResponse={handleApprovalResponse} />
            ))}
          </div>

          {/* Typing indicator */}
          {typingLabel && (
            <div className="px-4 py-2">
              <Text size="sm" className="text-neutral-500">
                {typingLabel}
              </Text>
            </div>
          )}

          {/* Input */}
          <div
            className="border-t border-neutral-800 bg-charcoal"
            style={{ paddingBottom: 12 }}
          >
            <ChatInput threadId={activeThreadId} />
          </div>
        </div>
      )}
    </div>
  );
}
