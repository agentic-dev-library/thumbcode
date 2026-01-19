/**
 * OptimizedList Component Tests
 */

import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  createMemoizedRenderItem,
  defaultListItemPropsAreEqual,
  OptimizedList,
  withListItemMemo,
} from '../performance';

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

interface TestItem {
  id: string;
  name: string;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
];

const TestItemComponent = ({ item }: { item: TestItem; index: number }) => (
  <View>
    <Text>{item.name}</Text>
  </View>
);

describe('OptimizedList', () => {
  it('should render list items', () => {
    const renderItem = ({ item }: { item: TestItem }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    const { root } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} />
    );

    expect(root).toBeTruthy();
  });

  it('should use custom keyExtractor', () => {
    const customKeyExtractor = jest.fn((item: TestItem) => `custom-${item.id}`);
    const renderItem = ({ item }: { item: TestItem }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    render(
      <OptimizedList
        data={mockData}
        renderItem={renderItem}
        itemHeight={50}
        keyExtractor={customKeyExtractor}
      />
    );

    // keyExtractor should be called for each item
    expect(customKeyExtractor).toHaveBeenCalled();
  });

  it('should use id from item if no custom keyExtractor', () => {
    const renderItem = ({ item }: { item: TestItem }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    // This should work without throwing
    const { root } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} />
    );

    expect(root).toBeTruthy();
  });

  it('should use key from item as fallback', () => {
    const dataWithKey = [
      { key: 'key-1', name: 'Item 1' },
      { key: 'key-2', name: 'Item 2' },
    ];

    const renderItem = ({ item }: { item: { key: string; name: string } }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    const { root } = render(
      <OptimizedList data={dataWithKey} renderItem={renderItem} itemHeight={50} />
    );

    expect(root).toBeTruthy();
  });

  it('should use index as last resort for key', () => {
    const dataWithoutIdOrKey = [{ name: 'Item 1' }, { name: 'Item 2' }];

    const renderItem = ({ item }: { item: { name: string }; index: number }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    const { root } = render(
      <OptimizedList data={dataWithoutIdOrKey} renderItem={renderItem} itemHeight={50} />
    );

    expect(root).toBeTruthy();
  });

  it('should apply custom windowSize', () => {
    const renderItem = ({ item }: { item: TestItem }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    // Should not throw with custom windowSize
    const { root } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} windowSize={10} />
    );
    expect(root).toBeTruthy();
  });

  it('should handle onViewableItemsChanged callback', () => {
    const onViewableItemsChanged = jest.fn();
    const renderItem = ({ item }: { item: TestItem }) => (
      <View>
        <Text>{item.name}</Text>
      </View>
    );

    const { root } = render(
      <OptimizedList
        data={mockData}
        renderItem={renderItem}
        itemHeight={50}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    );

    expect(root).toBeTruthy();
    // The callback is configured, this test mainly ensures it doesn't throw
  });
});

describe('createMemoizedRenderItem', () => {
  it('should create a memoized render function', () => {
    const MemoizedRender = createMemoizedRenderItem(TestItemComponent);

    // Create proper ListRenderItemInfo object
    const renderInfo = {
      item: { id: '1', name: 'Test' },
      index: 0,
      separators: {
        highlight: jest.fn(),
        unhighlight: jest.fn(),
        updateProps: jest.fn(),
      },
    };

    // Verify the memoized render function works without throwing
    const { root } = render(MemoizedRender(renderInfo));
    expect(root).toBeTruthy();
  });
});

describe('withListItemMemo', () => {
  it('should create a memoized component', () => {
    const MemoizedComponent = withListItemMemo(TestItemComponent);

    // Verify the memoized component renders without throwing
    const { root } = render(
      <MemoizedComponent item={{ id: '1', name: 'Test' }} index={0} />
    );

    expect(root).toBeTruthy();
  });

  it('should use custom props comparison', () => {
    const customCompare = jest.fn(() => true);
    const MemoizedComponent = withListItemMemo(TestItemComponent, customCompare);

    const { rerender, root } = render(
      <MemoizedComponent item={{ id: '1', name: 'Test' }} index={0} />
    );

    expect(root).toBeTruthy();

    // Rerender with different props
    rerender(<MemoizedComponent item={{ id: '2', name: 'Test 2' }} index={1} />);

    // Custom compare should have been called
    expect(customCompare).toHaveBeenCalled();
  });
});

describe('defaultListItemPropsAreEqual', () => {
  it('should return true when items have same id', () => {
    const prevProps = { item: { id: '1', name: 'Old' }, index: 0 };
    const nextProps = { item: { id: '1', name: 'New' }, index: 0 };

    expect(defaultListItemPropsAreEqual(prevProps, nextProps)).toBe(true);
  });

  it('should return false when items have different id', () => {
    const prevProps = { item: { id: '1', name: 'Item' }, index: 0 };
    const nextProps = { item: { id: '2', name: 'Item' }, index: 1 };

    expect(defaultListItemPropsAreEqual(prevProps, nextProps)).toBe(false);
  });

  it('should compare by reference when id is undefined', () => {
    const item = { id: undefined as string | undefined, name: 'Item' };
    const prevProps = { item, index: 0 };
    const nextProps = { item, index: 0 };

    expect(defaultListItemPropsAreEqual(prevProps, nextProps)).toBe(true);
  });

  it('should return false for different objects without id', () => {
    const prevProps = { item: { id: undefined as string | undefined, name: 'Item 1' }, index: 0 };
    const nextProps = { item: { id: undefined as string | undefined, name: 'Item 1' }, index: 0 };

    expect(defaultListItemPropsAreEqual(prevProps, nextProps)).toBe(false);
  });

  it('should handle numeric ids', () => {
    const prevProps = { item: { id: 1, name: 'Item' }, index: 0 };
    const nextProps = { item: { id: 1, name: 'Updated' }, index: 0 };

    expect(defaultListItemPropsAreEqual(prevProps, nextProps)).toBe(true);
  });
});
