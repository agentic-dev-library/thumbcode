import React from 'react';
import { ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledActivityIndicator = styled(ActivityIndicator);

const Spinner = () => {
  return (
    <StyledActivityIndicator
      size="large"
      color="#FF7059"
    />
  );
};

export default Spinner;
