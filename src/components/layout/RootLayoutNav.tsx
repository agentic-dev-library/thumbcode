/**
 * Root Layout Navigation
 *
 * Navigation stack with onboarding redirect logic.
 * Handles routing between onboarding flow and main app tabs.
 */

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useOnboarding } from '@/contexts/onboarding';
import { getColor } from '@/utils/design-tokens';

export function RootLayoutNav() {
  const { isLoading, hasCompletedOnboarding } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isLoading, hasCompletedOnboarding, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-charcoal items-center justify-center">
        <ActivityIndicator size="large" color={getColor('coral', '500')} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: getColor('charcoal') },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="project/[id]"
        options={{
          headerShown: true,
          headerTitle: 'Project',
          headerStyle: { backgroundColor: getColor('charcoal') },
          headerTintColor: getColor('neutral', '50'),
        }}
      />
      <Stack.Screen
        name="agent/[id]"
        options={{
          headerShown: true,
          headerTitle: 'Agent',
          headerStyle: { backgroundColor: getColor('charcoal') },
          headerTintColor: getColor('neutral', '50'),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: { backgroundColor: getColor('charcoal') },
          headerTintColor: getColor('neutral', '50'),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
