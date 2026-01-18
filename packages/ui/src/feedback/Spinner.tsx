import { styled } from 'nativewind';
import { ActivityIndicator } from 'react-native';

const StyledActivityIndicator = styled(ActivityIndicator);

const Spinner = () => {
  return <StyledActivityIndicator size="large" color="#FF7059" />;
};

export default Spinner;
