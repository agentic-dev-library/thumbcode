/**
 * List Component (Web Primitive)
 *
 * A web-native list replacing React Native's FlatList.
 * Renders items using Array.map with data, renderItem, and keyExtractor props.
 */

import type { CSSProperties, ReactNode } from 'react';

export interface ListProps<T> {
  /** Array of data items to render */
  data: T[];
  /** Render function for each item */
  renderItem: (info: { item: T; index: number }) => ReactNode;
  /** Function to extract a unique key for each item */
  keyExtractor: (item: T, index: number) => string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test identifier, mapped to data-testid */
  testID?: string;
  /** Component to render when data is empty */
  ListEmptyComponent?: ReactNode;
  /** Component to render at the top of the list */
  ListHeaderComponent?: ReactNode;
  /** Component to render at the bottom of the list */
  ListFooterComponent?: ReactNode;
  /** Separator rendered between items */
  ItemSeparatorComponent?: () => ReactNode;
}

/**
 * A web-native list component that replaces React Native's FlatList.
 * Uses Array.map to render items with proper keys.
 */
export function List<T>({
  data,
  renderItem,
  keyExtractor,
  className = '',
  style,
  testID,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
}: Readonly<ListProps<T>>) {
  return (
    <div className={className} style={style} data-testid={testID}>
      {ListHeaderComponent}
      {data.length === 0 && ListEmptyComponent}
      {data.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {index > 0 && ItemSeparatorComponent?.()}
          {renderItem({ item, index })}
        </div>
      ))}
      {ListFooterComponent}
    </div>
  );
}
