/**
 * Performance Hooks Tests
 */

import { act, renderHook } from '@testing-library/react';
import type { Mock, MockInstance } from 'vitest';
import {
  useDebouncedCallback,
  useDebouncedValue,
  useIntersectionObserver,
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
vi.mock('../performance/monitor', () => ({
  perfMonitor: {
    trackRender: vi.fn(),
    trackMount: vi.fn(),
  },
}));

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Get the mocked perfMonitor
import { perfMonitor } from '../performance/monitor';

describe('Performance Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
        initialProps: { value: 'initial' },
      });

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated' });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Fast forward timer
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Now it should be updated
      expect(result.current).toBe('updated');
    });

    it('should reset timer on rapid changes', () => {
      const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
        initialProps: { value: 'initial' },
      });

      // Multiple rapid changes
      rerender({ value: 'change1' });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      rerender({ value: 'change2' });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      rerender({ value: 'change3' });

      // Still initial
      expect(result.current).toBe('initial');

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should have final value
      expect(result.current).toBe('change3');
    });
  });

  describe('useThrottledCallback', () => {
    it('should execute callback immediately on first call', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 500));

      act(() => {
        result.current('arg1');
      });

      expect(callback).toHaveBeenCalledWith('arg1');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const callback = vi.fn();
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
        vi.advanceTimersByTime(500);
      });

      // Trailing call should execute
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('call3');
    });

    it('should allow call after delay has passed', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 500));

      act(() => {
        result.current('call1');
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(600);
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
      const callback = vi.fn();
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
        vi.advanceTimersByTime(500);
      });

      // Only last call should execute
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('should reset timer on each call', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('call1');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current('call2');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Still not called
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
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
      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 'initial' },
      });

      expect(result.current).toBeUndefined();

      rerender({ value: 'updated' });

      expect(result.current).toBe('initial');

      rerender({ value: 'final' });

      expect(result.current).toBe('updated');
    });
  });

  describe('useStableCallback', () => {
    it('should return a stable function reference', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { result, rerender } = renderHook(({ callback }) => useStableCallback(callback), {
        initialProps: { callback: callback1 },
      });

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
      const factory = vi.fn(() => 'expensive value');

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
      const { result, rerender } = renderHook(({ array }) => useStableArray(array), {
        initialProps: { array: [1, 2, 3] },
      });

      const firstRef = result.current;

      // Same content, new array instance
      rerender({ array: [1, 2, 3] });

      expect(result.current).toBe(firstRef);
    });

    it('should return new reference if array content changes', () => {
      const { result, rerender } = renderHook(({ array }) => useStableArray(array), {
        initialProps: { array: [1, 2, 3] },
      });

      const firstRef = result.current;

      rerender({ array: [1, 2, 4] });

      expect(result.current).not.toBe(firstRef);
      expect(result.current).toEqual([1, 2, 4]);
    });

    it('should detect length changes', () => {
      const { result, rerender } = renderHook(({ array }) => useStableArray(array), {
        initialProps: { array: [1, 2, 3] },
      });

      const firstRef = result.current;

      rerender({ array: [1, 2] });

      expect(result.current).not.toBe(firstRef);
    });
  });

  describe('useStableObject', () => {
    it('should return same reference if object content is identical', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: { a: 1, b: 2 } },
      });

      const firstRef = result.current;

      // Same content, new object instance
      rerender({ obj: { a: 1, b: 2 } });

      expect(result.current).toBe(firstRef);
    });

    it('should return new reference if object content changes', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: { a: 1, b: 2 } },
      });

      const firstRef = result.current;

      rerender({ obj: { a: 1, b: 3 } });

      expect(result.current).not.toBe(firstRef);
      expect(result.current).toEqual({ a: 1, b: 3 });
    });

    it('should detect key additions', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: { a: 1 } as Record<string, number> },
      });

      const firstRef = result.current;

      rerender({ obj: { a: 1, b: 2 } });

      expect(result.current).not.toBe(firstRef);
    });
  });

  describe('useWindowDimensions', () => {
    let addEventListenerSpy: MockInstance;
    let removeEventListenerSpy: MockInstance;
    let originalInnerWidth: number;
    let originalInnerHeight: number;

    beforeEach(() => {
      originalInnerWidth = window.innerWidth;
      originalInnerHeight = window.innerHeight;
      // Set dimensions on the existing window object
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 768,
        writable: true,
        configurable: true,
      });
      addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: originalInnerHeight,
        writable: true,
        configurable: true,
      });
    });

    it('should return current window dimensions', () => {
      const { result } = renderHook(() => useWindowDimensions());

      expect(result.current).toEqual({ width: 1024, height: 768 });
    });

    it('should add resize event listener', () => {
      renderHook(() => useWindowDimensions());

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useWindowDimensions());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should update dimensions on resize', () => {
      // Capture the resize handler registered by the hook
      let resizeHandler: (() => void) | null = null;
      addEventListenerSpy.mockImplementation((event: string, handler: EventListener) => {
        if (event === 'resize') {
          resizeHandler = handler as unknown as () => void;
        }
      });

      const { result } = renderHook(() => useWindowDimensions());

      expect(result.current).toEqual({ width: 1024, height: 768 });

      // Simulate resize
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true,
        configurable: true,
      });

      act(() => {
        resizeHandler?.();
      });

      expect(result.current).toEqual({ width: 800, height: 600 });
    });
  });

  describe('useIntersectionObserver', () => {
    let mockObserver: {
      observe: Mock;
      disconnect: Mock;
      unobserve: Mock;
    };
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;
    let mockElement: Element;

    beforeEach(() => {
      // Create a mock element
      mockElement = {
        nodeType: 1,
        nodeName: 'DIV',
      } as unknown as Element;

      mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      };

      // Must use function (not arrow) so it can be called with `new`
      const MockIntersectionObserver = vi.fn(function MockIO(
        this: unknown,
        _callback: (entries: IntersectionObserverEntry[]) => void
      ) {
        observerCallback = _callback;
        return mockObserver;
      });
      (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
        MockIntersectionObserver;
    });

    afterEach(() => {
      delete (global as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
    });

    it('should return a ref and initial visibility as false', () => {
      const { result } = renderHook(() => useIntersectionObserver());

      expect(result.current[0]).toEqual({ current: null });
      expect(result.current[1]).toBe(false);
    });

    it('should observe element when ref is set and update visibility', () => {
      const { result, rerender } = renderHook(() => {
        const [ref, isVisible] = useIntersectionObserver();
        return { ref, isVisible };
      });

      // Initially not visible
      expect(result.current.isVisible).toBe(false);

      // Set the ref to mock element
      act(() => {
        (result.current.ref as React.MutableRefObject<Element | null>).current = mockElement;
      });

      // Re-render to trigger effect
      rerender({});

      // Observer should be created and observing
      expect(IntersectionObserver).toHaveBeenCalled();
      expect(mockObserver.observe).toHaveBeenCalledWith(mockElement);

      // Simulate intersection callback
      act(() => {
        observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
      });

      expect(result.current.isVisible).toBe(true);
    });

    it('should disconnect observer on unmount', () => {
      const { result, unmount, rerender } = renderHook(() => {
        const [ref] = useIntersectionObserver();
        return ref;
      });

      // Set element
      act(() => {
        (result.current as React.MutableRefObject<Element | null>).current = mockElement;
      });

      rerender({});

      // Observer should be created
      expect(mockObserver.observe).toHaveBeenCalled();

      unmount();

      expect(mockObserver.disconnect).toHaveBeenCalled();
    });

    it('should not observe when element is null', () => {
      renderHook(() => useIntersectionObserver());

      // Observer should be created but not observe anything
      expect(mockObserver.observe).not.toHaveBeenCalled();
    });
  });

  describe('useThrottledCallback cleanup', () => {
    it('should clear pending timeout on unmount', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useThrottledCallback(callback, 500));

      // First call executes immediately
      act(() => {
        result.current('call1');
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Second call schedules a trailing call
      act(() => {
        result.current('call2');
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Unmount before timeout fires
      unmount();

      // Advance time past the delay
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Callback should still only have been called once (cleanup cleared the timeout)
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should clear timeout and execute immediately when delay has fully elapsed', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 500));

      // First call - executes immediately
      act(() => {
        result.current('call1');
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Second call while still throttled - schedules trailing
      act(() => {
        result.current('call2');
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Wait for delay to fully elapse plus some extra time
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // Trailing call executed
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('call2');

      // Wait more time so next call is after full delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Now call again - this exercises the remaining <= 0 branch
      act(() => {
        result.current('call3');
      });

      // Should execute immediately since delay has elapsed
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenLastCalledWith('call3');
    });
  });
});
