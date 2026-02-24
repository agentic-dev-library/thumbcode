import { act, renderHook } from '@testing-library/react';
import { useIsOnline, useNetworkError } from '../use-network-error';

vi.mock('@/lib/error-handler', () => ({
  createAppError: vi.fn((msg: string, opts: Record<string, unknown>) => ({
    message: msg,
    code: opts.code,
    severity: opts.severity,
    recoverable: opts.recoverable,
  })),
  handleError: vi.fn((err: unknown) => ({
    message: err instanceof Error ? err.message : String(err),
    code: 'UNKNOWN',
  })),
  ErrorCodes: {
    NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useNetworkError', () => {
  it('returns initial connected state', () => {
    const { result } = renderHook(() => useNetworkError());
    expect(result.current.network.isConnected).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('goes offline when offline event fires', () => {
    const { result } = renderHook(() => useNetworkError());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.network.isConnected).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('goes back online when online event fires', () => {
    const { result } = renderHook(() => useNetworkError());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOffline).toBe(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOffline).toBe(false);
  });

  it('clearError resets error to null', () => {
    const { result } = renderHook(() => useNetworkError());
    act(() => {
      result.current.setError(new Error('test error'));
    });
    expect(result.current.error).not.toBeNull();
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('retryIfOnline returns null when offline', async () => {
    const { result } = renderHook(() => useNetworkError());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    let value: string | null = null;
    await act(async () => {
      value = await result.current.retryIfOnline(() => Promise.resolve('data'));
    });
    expect(value).toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  it('retryIfOnline executes function when online', async () => {
    const { result } = renderHook(() => useNetworkError());
    let value: string | null = null;
    await act(async () => {
      value = await result.current.retryIfOnline(() => Promise.resolve('data'));
    });
    expect(value).toBe('data');
  });

  it('retryIfOnline handles errors from function', async () => {
    const { result } = renderHook(() => useNetworkError());
    let value: string | null = 'initial';
    await act(async () => {
      value = await result.current.retryIfOnline(() => Promise.reject(new Error('fail')));
    });
    expect(value).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});

describe('useIsOnline', () => {
  it('returns true by default', () => {
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });

  it('returns false after offline event', () => {
    const { result } = renderHook(() => useIsOnline());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
  });

  it('returns true after online event', () => {
    const { result } = renderHook(() => useIsOnline());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
