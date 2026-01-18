/**
 * Performance Module
 *
 * Utilities and components for app performance optimization.
 */

// Performance hooks
export {
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
} from './hooks';
// Performance monitoring
export {
  type PerformanceMetric,
  PerformanceMonitor,
  perfMonitor,
  type RenderMetric,
} from './monitor';

// Optimized components
export {
  createMemoizedRenderItem,
  defaultListItemPropsAreEqual,
  OptimizedList,
  type OptimizedListProps,
  withListItemMemo,
} from './OptimizedList';
