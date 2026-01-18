import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styled } from 'nativewind';

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
      style={{
        borderRadius: '0.375rem 0.5rem 0.625rem 0.25rem',
      }}
      onPress={onPress}
    >
      <StyledText className="text-charcoal font-body font-bold text-sm">
        {title}
      </StyledText>
    </StyledTouchableOpacity>
  );
};

export default ActionButton;
