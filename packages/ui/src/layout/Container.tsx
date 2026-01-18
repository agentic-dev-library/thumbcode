import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledView className="flex-1 bg-charcoal p-4">
      {children}
    </StyledView>
  );
};

export default Container;
