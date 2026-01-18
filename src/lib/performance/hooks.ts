/**
 * Performance Hooks
 *
 * React hooks for measuring and optimizing component performance.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { perfMonitor } from './monitor';

/**
 * Track component render time
 */
export function useRenderTime(componentName: string): void {
  const renderStart = useRef(performance.now());

  // Track render on each render
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    perfMonitor.trackRender(componentName, renderTime);
    renderStart.current = performance.now();
  });
}

/**
 * Track component mount time
 */
export function useMountTime(componentName: string): void {
  const mountStart = useRef(performance.now());
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      const mountTime = performance.now() - mountStart.current;
      perfMonitor.trackMount(componentName, mountTime);
      mounted.current = true;
    }
  }, [componentName]);
}

/**
 * Combined performance tracking for a component
 */
export function usePerformanceTracking(componentName: string): void {
  useRenderTime(componentName);
  useMountTime(componentName);
}

/**
 * Debounced value - useful for search inputs and similar
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled callback - limits function execution frequency
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastArgs = useRef<unknown[] | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttled = useCallback(
    (...args: unknown[]): unknown => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      lastArgs.current = args;

      if (remaining <= 0) {
        lastCall.current = now;
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }
        return callback(...args);
      }

      if (!timeoutId.current) {
        timeoutId.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeoutId.current = null;
          if (lastArgs.current) {
            callback(...lastArgs.current);
          }
        }, remaining);
      }

      return undefined;
    },
    [callback, delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return throttled;
}

/**
 * Debounced callback - delays execution until after wait period
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: unknown[]) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return debounced;
}

/**
 * Previous value - useful for comparing state changes
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Stable reference for callbacks - prevents unnecessary re-renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: unknown[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Lazy initialization - defers expensive computations
 */
export function useLazyValue<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

/**
 * Memoized array - prevents reference changes when content is the same
 */
export function useStableArray<T>(array: T[]): T[] {
  const ref = useRef<T[]>(array);

  const isEqual =
    ref.current.length === array.length &&
    ref.current.every((item, index) => item === array[index]);

  if (!isEqual) {
    ref.current = array;
  }

  return ref.current;
}

/**
 * Memoized object - prevents reference changes when content is the same
 */
export function useStableObject<T extends Record<string, unknown>>(obj: T): T {
  const ref = useRef<T>(obj);

  const isEqual = useMemo(() => {
    const keys1 = Object.keys(ref.current);
    const keys2 = Object.keys(obj);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => ref.current[key] === obj[key]);
  }, [obj]);

  if (!isEqual) {
    ref.current = obj;
  }

  return ref.current;
}

/**
 * Intersection observer for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element | null>, boolean] {
  const elementRef = useRef<Element | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [elementRef, isVisible];
}

/**
 * Window dimensions with resize tracking
 */
export function useWindowDimensions(): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}
