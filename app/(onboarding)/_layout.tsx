/**
 * Onboarding Layout
 *
 * Stack navigator for the onboarding flow.
 */

import { Stack } from 'expo-router';
import { getColor } from '@/utils/design-tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: getColor('charcoal') },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="github-auth" />
      <Stack.Screen name="api-keys" />
      <Stack.Screen name="create-project" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
