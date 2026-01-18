/**
 * Onboarding Layout
 *
 * Stack navigator for the onboarding flow.
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#151820' },
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
