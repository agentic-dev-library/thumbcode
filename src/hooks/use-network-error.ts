/**
 * Network Error Hook
 *
 * Provides network status monitoring and error handling for components.
 */

import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';
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
    isConnected: true,
    isInternetReachable: true,
    type: null,
  });
  const [error, setErrorState] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetwork({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });

      // Log network state changes
      if (state.isConnected === false) {
        logger.warn('Device went offline', { type: state.type });
      } else if (state.isConnected === true && network.isConnected === false) {
        logger.info('Device came back online', { type: state.type });
      }
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setNetwork({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return unsubscribe;
  }, [network.isConnected]);

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
      // Check if offline
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
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}
