/**
 * Onboarding Context
 *
 * Provides onboarding state management across the app.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setHasCompletedOnboarding(value === 'true');
      } catch {
        // If storage fails, default to not completed
        setHasCompletedOnboarding(false);
      }
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch {
      // Still update state even if storage fails
      setHasCompletedOnboarding(true);
    }
  }, []);

  const value = useMemo(
    () => ({ isLoading, hasCompletedOnboarding, completeOnboarding }),
    [isLoading, hasCompletedOnboarding, completeOnboarding]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}
