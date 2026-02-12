/**
 * useAppRouter Hook
 *
 * Wraps React Router's navigation hooks to provide an API similar to
 * expo-router's useRouter/useLocalSearchParams, easing the migration.
 */

import { useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * Navigation hook that mirrors expo-router's useRouter API.
 *
 * Usage:
 *   const router = useAppRouter();
 *   router.push('/projects');
 *   router.replace('/welcome');
 *   router.back();
 */
export function useAppRouter() {
  const navigate = useNavigate();

  const push = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const replace = useCallback(
    (path: string) => {
      navigate(path, { replace: true });
    },
    [navigate]
  );

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return { push, replace, back, navigate };
}

/**
 * Typed params hook matching expo-router's useLocalSearchParams pattern.
 *
 * Usage:
 *   const { id } = useRouteParams<{ id: string }>();
 */
export function useRouteParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return useParams() as T;
}

/**
 * Returns current pathname segments (like expo-router's useSegments).
 *
 * Usage:
 *   const segments = useRouteSegments();
 *   // pathname "/onboarding/welcome" → ["onboarding", "welcome"]
 */
export function useRouteSegments(): string[] {
  const location = useLocation();
  return location.pathname.split('/').filter(Boolean);
}
