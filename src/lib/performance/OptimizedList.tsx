/**
 * Optimized List Component
 *
 * Web-based list component with virtual scrolling concepts.
 * Replaces React Native's FlatList for web.
 */

import React, { memo, useCallback, useMemo, useRef } from 'react';

export interface OptimizedListProps<T> {
  /** Data to render */
  data: T[] | null | undefined;
  /** Render function for each item */
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  /** Height of each item (for optimization hints) */
  itemHeight: number;
  /** Number of items to render above/below viewport */
  windowSize?: number;
  /** Threshold for onEndReached callback */
  endReachedThreshold?: number;
  /** Whether to show footer loading indicator */
  isLoadingMore?: boolean;
  /** Key extractor */
  keyExtractor?: (item: T, index: number) => string;
  /** onEndReached callback */
  onEndReached?: () => void;
  /** className for the container */
  className?: string;
  /** Style for the container */
  style?: React.CSSProperties;
}

function OptimizedListInner<T>(
  props: OptimizedListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    data,
    renderItem,
    keyExtractor: customKeyExtractor,
    className,
    style,
    ...rest
  } = props;

  const keyExtractor = useCallback(
    (item: T, index: number) => {
      if (customKeyExtractor) {
        return customKeyExtractor(item, index);
      }
      const itemObj = item as Record<string, unknown>;
      if (typeof itemObj.id === 'string' || typeof itemObj.id === 'number') {
        return String(itemObj.id);
      }
      if (typeof itemObj.key === 'string' || typeof itemObj.key === 'number') {
        return String(itemObj.key);
      }
      return String(index);
    },
    [customKeyExtractor]
  );

  return (
    <div ref={ref} className={className} style={{ overflowY: 'auto', ...style }}>
      {(data ?? []).map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );
}

// Export with forwardRef and memo
export const OptimizedList = memo(React.forwardRef(OptimizedListInner)) as <T>(
  props: OptimizedListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

/**
 * Create a memoized render item function
 */
export function createMemoizedRenderItem<T>(
  Component: React.ComponentType<{ item: T; index: number }>
): (info: { item: T; index: number }) => React.ReactElement {
  const MemoizedComponent = memo(Component);

  return ({ item, index }: { item: T; index: number }) => (
    <MemoizedComponent item={item} index={index} />
  );
}

/**
 * HOC to memoize list item components
 */
export function withListItemMemo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, propsAreEqual);
}

/**
 * Default props comparison for list items
 */
export function defaultListItemPropsAreEqual<T extends { id?: string | number }>(
  prevProps: { item: T; index: number },
  nextProps: { item: T; index: number }
): boolean {
  if (prevProps.item.id !== undefined && nextProps.item.id !== undefined) {
    return prevProps.item.id === nextProps.item.id;
  }
  return prevProps.item === nextProps.item;
}
