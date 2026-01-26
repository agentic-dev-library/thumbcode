/**
 * Root Layout
 *
 * Main app layout that provides navigation stack, theme providers,
 * global context, and error handling for ThumbCode.
 */

import { certificatePinningService, runtimeSecurityService } from '@thumbcode/core';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/error';
import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding';
import { logger, setupGlobalErrorHandlers } from '@/lib';
import { getColor } from '@/utils/design-tokens';
import '../global.css';

// Initialize global error handlers
setupGlobalErrorHandlers();
logger.info('ThumbCode app started');

function RootLayoutNav() {
  const { isLoading, hasCompletedOnboarding } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';

    if (!hasCompletedOnboarding && !inOnboarding) {
      // Redirect to onboarding
      router.replace('/(onboarding)/welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      // Redirect to main app
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

export default function RootLayout() {
  useEffect(() => {
    certificatePinningService.initialize();
    runtimeSecurityService.checkAndHandleRootedStatus();
  }, []);

  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </OnboardingProvider>
    </ErrorBoundary>
  );
}
