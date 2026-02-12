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
import { ActivityIndicator, View } from 'react-native';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useOnboarding } from '@/contexts/onboarding';
import { getColor } from '@/utils/design-tokens';

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
      <View className="flex-1 bg-charcoal items-center justify-center">
        <ActivityIndicator size="large" color={getColor('coral', '500')} />
      </View>
    );
  }

  return <Outlet />;
}
