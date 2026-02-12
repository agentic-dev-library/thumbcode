/**
 * Onboarding Context
 *
 * Provides onboarding state management across the app.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ONBOARDING_COMPLETE_KEY = 'thumbcode_onboarding_complete';

interface OnboardingContextValue {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    try {
      const value = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setHasCompletedOnboarding(value === 'true');
    } catch {
      setHasCompletedOnboarding(false);
    }
    setIsLoading(false);
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const value = useMemo(
    () => ({ isLoading, hasCompletedOnboarding, completeOnboarding }),
    [isLoading, hasCompletedOnboarding, completeOnboarding]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
