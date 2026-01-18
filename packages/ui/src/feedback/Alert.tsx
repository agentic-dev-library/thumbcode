import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { Text, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning';
}

const Alert = ({ message, type }: AlertProps) => {
  const containerClasses = {
    success: 'bg-teal-600',
    error: 'bg-coral-500',
    warning: 'bg-gold-400',
  };

  const icon = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    warning: 'warning',
  };

  return (
    <StyledView
      className={`${containerClasses[type]} p-4 rounded-lg flex-row items-center`}
      style={{
        borderRadius: '0.6rem 0.8rem 0.7rem 0.9rem',
      }}
    >
      <Ionicons name={icon[type]} size={24} color="white" className="mr-2" />
      <StyledText className="text-white font-body">{message}</StyledText>
    </StyledView>
  );
};

export default Alert;
