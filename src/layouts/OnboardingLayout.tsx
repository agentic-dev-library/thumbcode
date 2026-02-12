/**
 * Onboarding Layout
 *
 * Stack-like layout for the onboarding flow.
 * Replaces app/(onboarding)/_layout.tsx from expo-router.
 */

import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-charcoal">
      <Outlet />
    </div>
  );
}
