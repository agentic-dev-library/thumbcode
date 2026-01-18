import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps {
  onPress: () => void;
  title: string;
}

const Button = ({ onPress, title }: ButtonProps) => {
  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className="bg-primary-400 py-3 px-6 shadow-organic-card"
      style={{
        borderRadius: '0.5rem 0.75rem 0.625rem 0.875rem',
        transform: 'rotate(-0.2deg)',
      }}
    >
      <StyledText className="text-white font-cabin text-center text-lg">{title}</StyledText>
    </StyledTouchableOpacity>
  );
};

export default Button;
