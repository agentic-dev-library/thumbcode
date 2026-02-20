import type { Message } from '@thumbcode/state';
import { organicBorderRadius } from '../../theme/organic-styles';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`
        p-3 my-1 max-w-[80%]
        ${isUser ? 'bg-teal-600 self-end' : 'bg-coral-500 self-start'}
      `}
      style={isUser ? organicBorderRadius.chatBubbleUser : organicBorderRadius.chatBubbleAgent}
    >
      <span className="text-white font-body">{message.content}</span>
    </div>
  );
};

export default ChatBubble;
