import { styled } from 'nativewind';
import { Text, View } from 'react-native';
import type { Message } from '@thumbcode/state';
import { organicBorderRadius } from '../../theme/organic-styles';

const StyledView = styled(View);
const StyledText = styled(Text);

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.sender === 'user';

  return (
    <StyledView
      className={`
        p-3 my-1 max-w-[80%]
        ${isUser ? 'bg-teal-600 self-end' : 'bg-coral-500 self-start'}
      `}
      style={isUser ? organicBorderRadius.chatBubbleUser : organicBorderRadius.chatBubbleAgent}
    >
      <StyledText className="text-white font-body">{message.text}</StyledText>
    </StyledView>
  );
};

export default ChatBubble;
