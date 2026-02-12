/**
 * App Providers
 *
 * Wraps the app with all required providers:
 * error boundary and onboarding context.
 *
 * Note: GestureHandlerRootView and SafeAreaProvider (React Native)
 * have been removed during the Capacitor migration. Web equivalents
 * are not needed — safe area is handled via CSS env() and gestures
 * via standard DOM events.
 */

import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error';
import { OnboardingProvider } from '@/contexts/onboarding';

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </ErrorBoundary>
  );
}
