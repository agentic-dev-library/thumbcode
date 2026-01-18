import React from 'react';
import { ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledActivityIndicator = styled(ActivityIndicator);

const Spinner = () => {
  return (
    <StyledActivityIndicator
      size="large"
      className="text-primary-400"
    />
  );
};

export default Spinner;
