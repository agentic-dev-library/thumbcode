/**
 * Performance Hooks Tests
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  useDebouncedCallback,
  useDebouncedValue,
  useLazyValue,
  useMountTime,
  usePerformanceTracking,
  usePrevious,
  useRenderTime,
  useStableArray,
  useStableCallback,
  useStableObject,
  useThrottledCallback,
  useWindowDimensions,
} from '../performance';

// Mock the performance monitor
jest.mock('../performance/monitor', () => ({
  perfMonitor: {
    trackRender: jest.fn(),
    trackMount: jest.fn(),
  },
}));

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Get the mocked perfMonitor
import { perfMonitor } from '../performance/monitor';

describe('Performance Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useRenderTime', () => {
    it('should track render time on mount', () => {
      renderHook(() => useRenderTime('TestComponent'));

      expect(perfMonitor.trackRender).toHaveBeenCalledWith('TestComponent', expect.any(Number));
    });

    it('should track render time on each re-render', () => {
      const { rerender } = renderHook(() => useRenderTime('TestComponent'));

      expect(perfMonitor.trackRender).toHaveBeenCalledTimes(1);

      rerender({});

      expect(perfMonitor.trackRender).toHaveBeenCalledTimes(2);
    });
  });

  describe('useMountTime', () => {
    it('should track mount time once', () => {
      renderHook(() => useMountTime('TestComponent'));

      expect(perfMonitor.trackMount).toHaveBeenCalledWith('TestComponent', expect.any(Number));
      expect(perfMonitor.trackMount).toHaveBeenCalledTimes(1);
    });

    it('should not track mount time on re-render', () => {
      const { rerender } = renderHook(() => useMountTime('TestComponent'));

      rerender({});
      rerender({});

      // Still only called once
      expect(perfMonitor.trackMount).toHaveBeenCalledTimes(1);
    });
  });

  describe('usePerformanceTracking', () => {
    it('should track both render and mount time', () => {
      renderHook(() => usePerformanceTracking('TestComponent'));

      expect(perfMonitor.trackRender).toHaveBeenCalled();
      expect(perfMonitor.trackMount).toHaveBeenCalled();
    });
  });

  describe('useDebouncedValue', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedValue('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 500),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated' });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Fast forward timer
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Now it should be updated
      expect(result.current).toBe('updated');
    });

    it('should reset timer on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 500),
        { initialProps: { value: 'initial' } }
      );

      // Multiple rapid changes
      rerender({ value: 'change1' });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      rerender({ value: 'change2' });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      rerender({ value: 'change3' });

      // Still initial
      expect(result.current).toBe('initial');

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should have final value
      expect(result.current).toBe('change3');
    });
  });

  describe('useThrottledCallback', () => {
    it('should execute callback immediately on first call', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 500));

      act(() => {
        result.current('arg1');
      });

      expect(callback).toHaveBeenCalledWith('arg1');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 500));

      act(() => {
        result.current('call1');
        result.current('call2');
        result.current('call3');
      });

      // Only first call should execute immediately
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('call1');

      // Wait for throttle to allow next call
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Trailing call should execute
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('call3');
    });

    it('should allow call after delay has passed', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 500));

      act(() => {
        result.current('call1');
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(600);
      });

      act(() => {
        result.current('call2');
      });

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('call2');
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('arg1');
        result.current('arg2');
        result.current('arg3');
      });

      // Callback should not have been called yet
      expect(callback).not.toHaveBeenCalled();

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Only last call should execute
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('should reset timer on each call', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('call1');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      act(() => {
        result.current('call2');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Still not called
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Now called with last value
      expect(callback).toHaveBeenCalledWith('call2');
    });
  });

  describe('usePrevious', () => {
    it('should return undefined on first render', () => {
      const { result } = renderHook(() => usePrevious('value'));

      expect(result.current).toBeUndefined();
    });

    it('should return previous value after update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBeUndefined();

      rerender({ value: 'updated' });

      expect(result.current).toBe('initial');

      rerender({ value: 'final' });

      expect(result.current).toBe('updated');
    });
  });

  describe('useStableCallback', () => {
    it('should return a stable function reference', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ callback }) => useStableCallback(callback),
        { initialProps: { callback: callback1 } }
      );

      const firstRef = result.current;

      rerender({ callback: callback2 });

      const secondRef = result.current;

      // Reference should be stable
      expect(firstRef).toBe(secondRef);

      // But should call the latest callback
      act(() => {
        result.current('test');
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('test');
    });
  });

  describe('useLazyValue', () => {
    it('should call factory only once', () => {
      const factory = jest.fn(() => 'expensive value');

      const { result, rerender } = renderHook(() => useLazyValue(factory));

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result.current).toBe('expensive value');

      rerender({});
      rerender({});

      expect(factory).toHaveBeenCalledTimes(1);
    });
  });

  describe('useStableArray', () => {
    it('should return same reference if array content is identical', () => {
      const { result, rerender } = renderHook(
        ({ array }) => useStableArray(array),
        { initialProps: { array: [1, 2, 3] } }
      );

      const firstRef = result.current;

      // Same content, new array instance
      rerender({ array: [1, 2, 3] });

      expect(result.current).toBe(firstRef);
    });

    it('should return new reference if array content changes', () => {
      const { result, rerender } = renderHook(
        ({ array }) => useStableArray(array),
        { initialProps: { array: [1, 2, 3] } }
      );

      const firstRef = result.current;

      rerender({ array: [1, 2, 4] });

      expect(result.current).not.toBe(firstRef);
      expect(result.current).toEqual([1, 2, 4]);
    });

    it('should detect length changes', () => {
      const { result, rerender } = renderHook(
        ({ array }) => useStableArray(array),
        { initialProps: { array: [1, 2, 3] } }
      );

      const firstRef = result.current;

      rerender({ array: [1, 2] });

      expect(result.current).not.toBe(firstRef);
    });
  });

  describe('useStableObject', () => {
    it('should return same reference if object content is identical', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useStableObject(obj),
        { initialProps: { obj: { a: 1, b: 2 } } }
      );

      const firstRef = result.current;

      // Same content, new object instance
      rerender({ obj: { a: 1, b: 2 } });

      expect(result.current).toBe(firstRef);
    });

    it('should return new reference if object content changes', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useStableObject(obj),
        { initialProps: { obj: { a: 1, b: 2 } } }
      );

      const firstRef = result.current;

      rerender({ obj: { a: 1, b: 3 } });

      expect(result.current).not.toBe(firstRef);
      expect(result.current).toEqual({ a: 1, b: 3 });
    });

    it('should detect key additions', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useStableObject(obj),
        { initialProps: { obj: { a: 1 } as Record<string, number> } }
      );

      const firstRef = result.current;

      rerender({ obj: { a: 1, b: 2 } });

      expect(result.current).not.toBe(firstRef);
    });
  });

  describe('useWindowDimensions', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;
    const originalWindow = global.window;
    const originalInnerWidth = global.window?.innerWidth;
    const originalInnerHeight = global.window?.innerHeight;

    beforeEach(() => {
      // Set up window properties and spies
      Object.defineProperty(global, 'window', {
        value: {
          ...originalWindow,
          innerWidth: 1024,
          innerHeight: 768,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
        writable: true,
      });
      addEventListenerSpy = jest.spyOn(global.window, 'addEventListener');
      removeEventListenerSpy = jest.spyOn(global.window, 'removeEventListener');
    });

    afterEach(() => {
      addEventListenerSpy?.mockRestore();
      removeEventListenerSpy?.mockRestore();
      if (originalWindow) {
        Object.defineProperty(global, 'window', {
          value: originalWindow,
          writable: true,
        });
      }
    });

    it('should return current window dimensions', () => {
      const { result } = renderHook(() => useWindowDimensions());

      expect(result.current).toEqual({ width: 1024, height: 768 });
    });

    it('should add resize event listener', () => {
      renderHook(() => useWindowDimensions());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useWindowDimensions());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });
  });
});
