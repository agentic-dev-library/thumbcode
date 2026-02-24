/**
 * Chat Screen
 *
 * Main chat interface for human-agent communication.
 * Thin composition layer -- all logic lives in hooks and components.
 */

import { ChevronLeft } from 'lucide-react';
import { ChatInput, ChatThread, ThreadList } from '@/components/chat';
import { useChatPage } from '@/hooks/use-chat-page';

export default function ChatPage() {
  const { activeThreadId, activeThreadTitle, setActiveThread, handleCreateThread } = useChatPage();

  if (!activeThreadId) {
    return (
      <div
        className="flex-1 flex flex-col bg-charcoal overflow-hidden animate-page-enter"
        data-testid="chat-screen"
      >
        <ThreadList onSelectThread={setActiveThread} onCreateThread={handleCreateThread} />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col bg-charcoal overflow-hidden animate-page-enter"
      data-testid="chat-screen"
    >
      {/* Thread header */}
      <div className="flex items-center px-4 py-3 border-b border-white/5 glass">
        <button
          type="button"
          onClick={() => setActiveThread(null)}
          className="mr-3 p-2 -ml-2 hover:bg-neutral-800 rounded-organic-button transition-colors tap-feedback"
          aria-label="Back to thread list"
        >
          <ChevronLeft size={18} className="text-neutral-400" />
        </button>
        <h2 className="font-display text-lg text-white flex-1 truncate">
          {activeThreadTitle || 'Chat'}
        </h2>
      </div>

      {/* Messages + typing indicator */}
      <ChatThread threadId={activeThreadId} />

      {/* Input */}
      <ChatInput threadId={activeThreadId} />
    </div>
  );
}
