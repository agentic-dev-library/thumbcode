import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { Text, TouchableOpacity, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface HeaderProps {
  title: string;
  canGoBack?: boolean;
}

const Header = ({ title, canGoBack = false }: HeaderProps) => {
  const router = useRouter();

  return (
    <StyledView className="flex-row items-center justify-between pb-4">
      {canGoBack && (
        <StyledTouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </StyledTouchableOpacity>
      )}
      <StyledText className="font-display text-2xl text-white">{title}</StyledText>
      <StyledView className="w-10" />
    </StyledView>
  );
};

export default Header;
