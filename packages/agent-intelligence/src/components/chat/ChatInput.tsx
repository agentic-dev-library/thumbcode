import { useChatStore } from '@thumbcode/state';
import { useState } from 'react';

const ChatInput = () => {
  const [text, setText] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = () => {
    if (text.trim()) {
      addMessage({
        threadId: '',
        content: text,
        contentType: 'text',
        sender: 'user',
      });
      setText('');
    }
  };

  return (
    <div className="flex-row p-2 border-t border-neutral-200 bg-surface">
      <input
        className="flex-1 border border-neutral-300 bg-neutral-800 text-white font-body px-3 mr-2 rounded-organic-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        type="button"
        className="bg-coral-500 px-4 justify-center active:bg-coral-700 rounded-organic-button"
        onClick={handleSend}
      >
        <span className="text-white font-body font-semibold">Send</span>
      </button>
    </div>
  );
};

export default ChatInput;
