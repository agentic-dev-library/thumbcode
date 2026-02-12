/**
 * Root Layout Navigation (Legacy)
 *
 * This component has been superseded by src/layouts/RootLayout.tsx
 * which uses react-router-dom instead of expo-router.
 *
 * Kept as a thin wrapper for backward compatibility during migration.
 * Routes are now defined in src/router.tsx.
 */

import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/onboarding';

export function RootLayoutNav() {
  const { isLoading, hasCompletedOnboarding } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = location.pathname.startsWith('/onboarding');

    if (!hasCompletedOnboarding && !inOnboarding) {
      navigate('/onboarding/welcome', { replace: true });
    } else if (hasCompletedOnboarding && inOnboarding) {
      navigate('/', { replace: true });
    }
  }, [isLoading, hasCompletedOnboarding, location, navigate]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-charcoal flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}
