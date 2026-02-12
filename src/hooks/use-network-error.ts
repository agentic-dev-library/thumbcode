/**
 * Network Error Hook
 *
 * Provides network status monitoring and error handling for components.
 * Uses navigator.onLine and online/offline events for web.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { type AppError, createAppError, ErrorCodes, handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

export interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

export interface NetworkErrorState {
  network: NetworkState;
  error: AppError | null;
  isLoading: boolean;
  isOffline: boolean;
  clearError: () => void;
  setError: (error: unknown) => void;
  retryIfOnline: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Hook for monitoring network status and handling network errors
 */
export function useNetworkError(): NetworkErrorState {
  const [network, setNetwork] = useState<NetworkState>({
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
    type: null,
  });
  const [error, setErrorState] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const prevIsConnectedRef = useRef<boolean | null>(true);

  useEffect(() => {
    const handleOnline = () => {
      if (prevIsConnectedRef.current === false) {
        logger.info('Device came back online');
      }
      prevIsConnectedRef.current = true;
      setNetwork({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      });
    };

    const handleOffline = () => {
      if (prevIsConnectedRef.current !== false) {
        logger.warn('Device went offline');
      }
      prevIsConnectedRef.current = false;
      setNetwork({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOffline = network.isConnected === false || network.isInternetReachable === false;

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const setError = useCallback((err: unknown) => {
    const appError = handleError(err, { source: 'networkError' });
    setErrorState(appError);
  }, []);

  /**
   * Execute a function only if online, with automatic error handling
   */
  const retryIfOnline = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      if (isOffline) {
        const offlineError = createAppError('Device is offline', {
          code: ErrorCodes.NETWORK_OFFLINE,
          severity: 'medium',
          recoverable: true,
        });
        setErrorState(offlineError);
        return null;
      }

      setIsLoading(true);
      setErrorState(null);

      try {
        const result = await fn();
        return result;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isOffline, setError]
  );

  return {
    network,
    error,
    isLoading,
    isOffline,
    clearError,
    setError,
    retryIfOnline,
  };
}

/**
 * Simple hook to just check if device is online
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
