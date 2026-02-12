import { useState } from 'react';
import { useChatStore } from '@thumbcode/state';
import { organicBorderRadius } from '../../theme/organic-styles';

const ChatInput = () => {
  const [text, setText] = useState('');
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = () => {
    if (text.trim()) {
      addMessage({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        text,
        sender: 'user',
        timestamp: new Date(),
      });
      setText('');
    }
  };

  return (
    <div className="flex-row p-2 border-t border-neutral-200 bg-surface">
      <spanInput
        className="flex-1 border border-neutral-300 bg-neutral-800 text-white font-body px-3 mr-2"
        style={organicBorderRadius.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#94A3B8"
      />
      <button
        className="bg-coral-500 px-4 justify-center active:bg-coral-700"
        style={organicBorderRadius.button}
        onClick={handleSend}
      >
        <span className="text-white font-body font-semibold">Send</span>
      </button>
    </div>
  );
};

export default ChatInput;
