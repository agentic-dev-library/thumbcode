/**
 * Root Layout
 *
 * Main app layout that provides navigation stack, theme providers,
 * and global context for ThumbCode.
 */

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

// Check if user has completed onboarding (mock for now)
function useOnboardingState() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // TODO: Check AsyncStorage/SecureStore for onboarding completion
    const checkOnboarding = async () => {
      // Simulate check - in production, read from storage
      await new Promise((resolve) => setTimeout(resolve, 500));
      setHasCompletedOnboarding(false); // Start fresh for now
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  return { isLoading, hasCompletedOnboarding, setHasCompletedOnboarding };
}

export default function RootLayout() {
  const { isLoading, hasCompletedOnboarding } = useOnboardingState();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const _inTabs = segments[0] === '(tabs)';

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
        <ActivityIndicator size="large" color="#FF7059" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#151820' },
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
              headerStyle: { backgroundColor: '#151820' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="agent/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Agent',
              headerStyle: { backgroundColor: '#151820' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              headerTitle: 'Settings',
              headerStyle: { backgroundColor: '#151820' },
              headerTintColor: '#fff',
              presentation: 'modal',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
