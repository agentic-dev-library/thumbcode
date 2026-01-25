import { styled } from 'nativewind';
import { Text, TouchableOpacity } from 'react-native';
import { organicBorderRadius } from '../../theme/organic-styles';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ActionButtonProps {
  title: string;
  onPress: () => void;
}

const ActionButton = ({ title, onPress }: ActionButtonProps) => {
  return (
    <StyledTouchableOpacity
      className="bg-gold-400 py-2 px-3 mx-1 active:bg-gold-600"
      style={organicBorderRadius.badge}
      onPress={onPress}
    >
      <StyledText className="text-charcoal font-body font-bold text-sm">{title}</StyledText>
    </StyledTouchableOpacity>
  );
};

export default ActionButton;
