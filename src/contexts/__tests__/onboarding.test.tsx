import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { OnboardingProvider, useOnboarding } from '../onboarding';

function wrapper({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

describe('OnboardingProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts loading then becomes ready', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    // After initial render effect runs
    await act(async () => {});
    expect(result.current.isLoading).toBe(false);
  });

  it('reads onboarding state from localStorage', async () => {
    localStorage.setItem('thumbcode_onboarding_complete', 'true');
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    await act(async () => {});
    expect(result.current.hasCompletedOnboarding).toBe(true);
  });

  it('defaults to not completed when localStorage is empty', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    await act(async () => {});
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });

  it('completes onboarding and persists to localStorage', async () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });
    await act(async () => {});
    await act(async () => {
      await result.current.completeOnboarding();
    });
    expect(result.current.hasCompletedOnboarding).toBe(true);
    expect(localStorage.getItem('thumbcode_onboarding_complete')).toBe('true');
  });
});

describe('useOnboarding', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useOnboarding())).toThrow(
      'useOnboarding must be used within OnboardingProvider'
    );
  });
});
