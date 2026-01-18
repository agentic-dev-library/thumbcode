// app/(tabs)/chat.tsx
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';

/**
 * Chat screen placeholder.
 * TODO: Integrate agent-intelligence chat components after NativeWind v4 migration
 */
export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="display" size="2xl" weight="semibold" className="text-coral-500 mb-2">
          Chat
        </Text>
        <Text className="text-neutral-600">
          Agent chat interface coming soon. The multi-agent communication system is being
          integrated.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
