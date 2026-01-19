/**
 * Not Found Screen
 *
 * Displayed when navigating to a route that doesn't exist.
 * Uses paint daube icons for brand consistency.
 */

import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-1 bg-charcoal items-center justify-center"
        style={{ paddingBottom: insets.bottom }}
      >
        <Container padding="lg">
          <VStack spacing="lg" align="center">
            {/* Icon */}
            <View
              className="w-24 h-24 bg-surface items-center justify-center"
              style={organicBorderRadius.hero}
            >
              <SearchIcon size={48} color="warmGray" turbulence={0.25} />
            </View>

            {/* Message */}
            <VStack spacing="sm" align="center">
              <Text size="2xl" weight="bold" className="text-white">
                Page Not Found
              </Text>
              <Text className="text-neutral-400 text-center">
                The page you're looking for doesn't exist or has been moved.
              </Text>
            </VStack>

            {/* Actions */}
            <VStack spacing="md" className="w-full">
              <Pressable
                onPress={() => router.replace('/(tabs)')}
                className="bg-coral-500 py-4 px-8 active:bg-coral-600"
                style={organicBorderRadius.cta}
              >
                <Text className="text-center text-white font-semibold">Go Home</Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                className="bg-surface py-4 px-8 active:bg-neutral-700"
                style={organicBorderRadius.cta}
              >
                <Text className="text-center text-white">Go Back</Text>
              </Pressable>
            </VStack>
          </VStack>
        </Container>
      </View>
    </>
  );
}
