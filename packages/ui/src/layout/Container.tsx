import { styled } from 'nativewind';
import type React from 'react';
import { View } from 'react-native';

const StyledView = styled(View);

const Container = ({ children }: { children: React.ReactNode }) => {
  return <StyledView className="flex-1 bg-charcoal p-4">{children}</StyledView>;
};

export default Container;
