/**
 * Optimized List Component
 *
 * Performance-optimized FlatList wrapper with built-in optimizations.
 */

import React, { memo, useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  type FlatListProps,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';

export interface OptimizedListProps<T> extends Omit<FlatListProps<T>, 'getItemLayout'> {
  /** Height of each item (required for optimization) */
  itemHeight: number;
  /** Number of items to render above/below viewport */
  windowSize?: number;
  /** Threshold for onEndReached callback */
  endReachedThreshold?: number;
  /** Whether to show footer loading indicator */
  isLoadingMore?: boolean;
  /** Key extractor override */
  keyExtractor?: (item: T, index: number) => string;
  /** onViewableItemsChanged callback */
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
}

function OptimizedListInner<T>(props: OptimizedListProps<T>, ref: React.ForwardedRef<FlatList<T>>) {
  const {
    itemHeight,
    windowSize = 5,
    endReachedThreshold = 0.5,
    data,
    renderItem,
    keyExtractor: customKeyExtractor,
    onViewableItemsChanged,
    ...rest
  } = props;

  // Memoize getItemLayout for consistent heights
  const getItemLayout = useCallback(
    (_data: ArrayLike<T> | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  // Default key extractor if not provided
  const keyExtractor = useCallback(
    (item: T, index: number) => {
      if (customKeyExtractor) {
        return customKeyExtractor(item, index);
      }
      // Try to use id or key from item, fallback to index
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

  // Viewability config for optimization
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  // Memoize viewable items callback
  const viewableItemsChanged = useMemo(
    () => (onViewableItemsChanged ? { onViewableItemsChanged, viewabilityConfig } : undefined),
    [onViewableItemsChanged, viewabilityConfig]
  );

  return (
    <FlatList
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      windowSize={windowSize}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      removeClippedSubviews
      onEndReachedThreshold={endReachedThreshold}
      {...viewableItemsChanged}
      {...rest}
    />
  );
}

// Export with forwardRef and memo
export const OptimizedList = memo(React.forwardRef(OptimizedListInner)) as <T>(
  props: OptimizedListProps<T> & { ref?: React.ForwardedRef<FlatList<T>> }
) => React.ReactElement;

/**
 * Create a memoized render item function
 */
export function createMemoizedRenderItem<T>(
  Component: React.ComponentType<{ item: T; index: number }>
): (info: ListRenderItemInfo<T>) => React.ReactElement {
  const MemoizedComponent = memo(Component);

  return ({ item, index }: ListRenderItemInfo<T>) => (
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
  // Compare by id if available, otherwise by reference
  if (prevProps.item.id !== undefined && nextProps.item.id !== undefined) {
    return prevProps.item.id === nextProps.item.id;
  }
  return prevProps.item === nextProps.item;
}
