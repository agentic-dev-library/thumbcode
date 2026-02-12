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
import { FlatList, Pressable, View } from 'react-native';
import { Badge } from '@/components/display';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

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

/**
 * Format relative time for thread
 */
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

/**
 * Get participant badge colors
 */
function getParticipantBadge(participant: ChatThread['participants'][number]) {
  const colorMap: Record<string, string> = {
    architect: 'bg-coral-500',
    implementer: 'bg-gold-500',
    reviewer: 'bg-teal-500',
    tester: 'bg-neutral-500',
  };
  return colorMap[participant] || 'bg-neutral-600';
}

function ThreadItem({ thread, onPress }: ThreadItemProps) {
  const hasUnread = thread.unreadCount > 0;
  const accessibilityLabel = [thread.title, hasUnread ? `${thread.unreadCount} unread` : '']
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-elevated p-4 mb-2 active:bg-neutral-700"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Open this thread"
      style={{ ...organicBorderRadius.card, transform: [{ rotate: '-0.2deg' }] }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          {/* Title with unread indicator */}
          <View className="flex-row items-center mb-1">
            {thread.isPinned && (
              <View className="mr-2">
                <Badge variant="warning" size="sm">
                  Pinned
                </Badge>
              </View>
            )}
            <Text
              variant="display"
              size="base"
              className={hasUnread ? 'text-white' : 'text-neutral-200'}
              numberOfLines={1}
            >
              {thread.title}
            </Text>
          </View>

          {/* Participants */}
          <View className="flex-row items-center mb-1">
            {thread.participants
              .filter((p) => p !== 'user')
              .slice(0, 3)
              .map((participant, index) => (
                <View
                  key={participant}
                  className={`w-2 h-2 rounded-full ${getParticipantBadge(participant)} ${
                    index > 0 ? 'ml-1' : ''
                  }`}
                />
              ))}
            {thread.participants.length > 4 && (
              <Text size="xs" className="text-neutral-500 ml-1">
                +{thread.participants.length - 4}
              </Text>
            )}
          </View>

          {/* Timestamp */}
          <Text size="xs" className="text-neutral-500">
            {formatRelativeTime(thread.lastMessageAt)}
          </Text>
        </View>

        {/* Unread badge */}
        {hasUnread && (
          <View
            className="bg-coral-500 px-2 py-0.5 min-w-[20px] items-center"
            style={organicBorderRadius.pill}
          >
            <Text size="xs" weight="semibold" className="text-white">
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function ThreadList({ onSelectThread, onCreateThread }: ThreadListProps) {
  const pinnedThreads = useChatStore(selectPinnedThreads);
  const recentThreads = useChatStore(selectRecentThreads);

  const allThreads = [...pinnedThreads, ...recentThreads];

  if (allThreads.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text variant="display" size="lg" className="text-neutral-400 text-center mb-2">
          No conversations yet
        </Text>
        <Text size="sm" className="text-neutral-500 text-center mb-4">
          Start a new thread to collaborate with AI agents
        </Text>
        {onCreateThread && (
          <Pressable
            onPress={onCreateThread}
            className="bg-coral-500 px-6 py-3 active:bg-coral-600"
            style={organicBorderRadius.button}
            accessibilityRole="button"
            accessibilityLabel="New Thread"
            accessibilityHint="Create a new chat thread"
          >
            <Text weight="semibold" className="text-white">
              New Thread
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header with new thread button */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-neutral-700">
        <Text variant="display" size="lg" className="text-white">
          Conversations
        </Text>
        {onCreateThread && (
          <Pressable
            onPress={onCreateThread}
            className="bg-teal-600 px-3 py-1.5 active:bg-teal-700"
            style={organicBorderRadius.button}
            accessibilityRole="button"
            accessibilityLabel="New Thread"
            accessibilityHint="Create a new chat thread"
          >
            <Text size="sm" weight="semibold" className="text-white">
              + New
            </Text>
          </Pressable>
        )}
      </View>

      {/* Pinned section */}
      {pinnedThreads.length > 0 && (
        <View className="mb-2">
          <Text size="xs" className="px-4 py-2 text-neutral-500 uppercase tracking-wider">
            Pinned
          </Text>
          {pinnedThreads.map((thread) => (
            <View key={thread.id} className="px-3">
              <ThreadItem thread={thread} onPress={() => onSelectThread(thread.id)} />
            </View>
          ))}
        </View>
      )}

      {/* Recent threads */}
      <FlatList
        data={recentThreads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-3">
            <ThreadItem thread={item} onPress={() => onSelectThread(item.id)} />
          </View>
        )}
        ListHeaderComponent={
          recentThreads.length > 0 ? (
            <Text size="xs" className="px-4 py-2 text-neutral-500 uppercase tracking-wider">
              Recent
            </Text>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
