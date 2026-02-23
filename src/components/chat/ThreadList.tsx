/**
 * Thread List Component
 *
 * Displays a list of chat threads with pinned threads at the top.
 * Uses organic styling with visual indicators for unread messages.
 */

import {
  type ChatThread,
  selectPinnedThreads,
  selectRecentThreads,
  useChatStore,
} from '@thumbcode/state';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '@/components/display';
import { Text } from '@/components/ui';
import { formatRelativeTime, getParticipantColor } from '@/lib/chat-utils';

/** Props for the ThreadList component */
interface ThreadListProps {
  /** Called when a thread is selected */
  onSelectThread: (threadId: string) => void;
  /** Called when the user wants to create a new thread */
  onCreateThread?: () => void;
}

/** Props for the ThreadItem component */
interface ThreadItemProps {
  /** The chat thread to display */
  thread: ChatThread;
  /** Called when the thread item is pressed */
  onPress: () => void;
}

function ThreadItem({ thread, onPress }: Readonly<ThreadItemProps>) {
  const hasUnread = thread.unreadCount > 0;
  const accessibilityLabel = [thread.title, hasUnread ? `${thread.unreadCount} unread` : '']
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={onPress}
      className="bg-surface-elevated p-4 mb-2 active:bg-neutral-700 rounded-organic-card"
      aria-label={accessibilityLabel}
      aria-description="Open this thread"
      style={{ transform: 'rotate(-0.2deg)' }}
    >
      <div className="flex-row items-start justify-between">
        <div className="flex-1 mr-3">
          {/* Title with unread indicator */}
          <div className="flex-row items-center mb-1">
            {thread.isPinned && (
              <div className="mr-2">
                <Badge variant="warning" size="sm">
                  Pinned
                </Badge>
              </div>
            )}
            <Text
              variant="display"
              size="base"
              className={hasUnread ? 'text-white' : 'text-neutral-200'}
              numberOfLines={1}
            >
              {thread.title}
            </Text>
          </div>

          {/* Participants */}
          <div className="flex-row items-center mb-1">
            {thread.participants
              .filter((p) => p !== 'user')
              .slice(0, 3)
              .map((participant, index) => (
                <div
                  key={participant}
                  className={`w-2 h-2 rounded-full ${getParticipantColor(participant)} ${
                    index > 0 ? 'ml-1' : ''
                  }`}
                />
              ))}
            {thread.participants.length > 4 && (
              <Text size="xs" className="text-neutral-500 ml-1">
                +{thread.participants.length - 4}
              </Text>
            )}
          </div>

          {/* Timestamp */}
          <Text size="xs" className="text-neutral-500">
            {formatRelativeTime(thread.lastMessageAt)}
          </Text>
        </div>

        {/* Unread badge */}
        {hasUnread && (
          <div
            className="bg-coral-500 px-2 py-0.5 min-w-[20px] items-center rounded-organic-input"
          >
            <Text size="xs" weight="semibold" className="text-white">
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </Text>
          </div>
        )}
      </div>
    </button>
  );
}

export function ThreadList({ onSelectThread, onCreateThread }: Readonly<ThreadListProps>) {
  const pinnedThreads = useChatStore(useShallow(selectPinnedThreads));
  const recentThreads = useChatStore(useShallow(selectRecentThreads));

  const allThreads = [...pinnedThreads, ...recentThreads];

  if (allThreads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Text variant="display" size="lg" className="text-neutral-400 text-center mb-2">
          No conversations yet
        </Text>
        <Text size="sm" className="text-neutral-500 text-center mb-4">
          Start a new thread to collaborate with AI agents
        </Text>
        {onCreateThread && (
          <button
            type="button"
            onClick={onCreateThread}
            className="bg-coral-500 px-6 py-3 active:bg-coral-600 rounded-organic-button"
            aria-label="New Thread"
            aria-description="Create a new chat thread"
          >
            <Text weight="semibold" className="text-white">
              New Thread
            </Text>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header with new thread button */}
      <div className="flex-row justify-between items-center px-4 py-3 border-b border-neutral-700">
        <Text variant="display" size="lg" className="text-white">
          Conversations
        </Text>
        {onCreateThread && (
          <button
            type="button"
            onClick={onCreateThread}
            className="bg-teal-600 px-3 py-1.5 active:bg-teal-700 rounded-organic-button"
            aria-label="New Thread"
            aria-description="Create a new chat thread"
          >
            <Text size="sm" weight="semibold" className="text-white">
              + New
            </Text>
          </button>
        )}
      </div>

      {/* Pinned section */}
      {pinnedThreads.length > 0 && (
        <div className="mb-2">
          <Text size="xs" className="px-4 py-2 text-neutral-500 uppercase tracking-wider">
            Pinned
          </Text>
          {pinnedThreads.map((thread) => (
            <div key={thread.id} className="px-3">
              <ThreadItem thread={thread} onPress={() => onSelectThread(thread.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Recent threads */}
      {recentThreads.length > 0 && (
        <Text size="xs" className="px-4 py-2 text-neutral-500 uppercase tracking-wider">
          Recent
        </Text>
      )}
      {recentThreads.map((item) => (
        <div key={item.id} className="px-3">
          <ThreadItem thread={item} onPress={() => onSelectThread(item.id)} />
        </div>
      ))}
    </div>
  );
}
