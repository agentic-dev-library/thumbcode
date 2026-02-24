/**
 * Root Layout
 *
 * Conditionally redirects between onboarding and main app based on
 * onboarding completion status. Replaces the expo-router RootLayoutNav.
 */

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useOnboarding } from '@/contexts/onboarding';
import { useAppRouter } from '@/hooks/use-app-router';

export function RootLayout() {
  const { isLoading, hasCompletedOnboarding } = useOnboarding();
  const { replace } = useAppRouter();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = location.pathname.startsWith('/onboarding');

    if (!hasCompletedOnboarding && !inOnboarding) {
      replace('/onboarding/welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      replace('/');
    }
  }, [isLoading, hasCompletedOnboarding, location.pathname, replace]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-charcoal">
        <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}
