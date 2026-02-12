/**
 * App Providers
 *
 * Wraps the app with all required providers:
 * error boundary, onboarding context, gesture handler, and safe area.
 */

import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/error';
import { OnboardingProvider } from '@/contexts/onboarding';

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            {children}
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </OnboardingProvider>
    </ErrorBoundary>
  );
}
