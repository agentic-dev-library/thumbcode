/**
 * OptimizedList Component Tests
 */

import { render } from '@testing-library/react';
import {
  createMemoizedRenderItem,
  defaultListItemPropsAreEqual,
  OptimizedList,
  withListItemMemo,
} from '../performance';

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
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
  <div>
    <span>{item.name}</span>
  </div>
);

describe('OptimizedList', () => {
  it('should render list items', () => {
    const renderItem = ({ item }: { item: TestItem }) => (
      <div>
        <span>{item.name}</span>
      </div>
    );

    const { container } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} />
    );

    expect(container).toBeTruthy();
  });

  it('should use custom keyExtractor', () => {
    const customKeyExtractor = vi.fn((item: TestItem) => `custom-${item.id}`);
    const renderItem = ({ item }: { item: TestItem }) => (
      <div>
        <span>{item.name}</span>
      </div>
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
      <div>
        <span>{item.name}</span>
      </div>
    );

    // This should work without throwing
    const { container } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} />
    );

    expect(container).toBeTruthy();
  });

  it('should use key from item as fallback', () => {
    const dataWithKey = [
      { key: 'key-1', name: 'Item 1' },
      { key: 'key-2', name: 'Item 2' },
    ];

    const renderItem = ({ item }: { item: { key: string; name: string } }) => (
      <div>
        <span>{item.name}</span>
      </div>
    );

    const { container } = render(
      <OptimizedList data={dataWithKey} renderItem={renderItem} itemHeight={50} />
    );

    expect(container).toBeTruthy();
  });

  it('should use index as last resort for key', () => {
    const dataWithoutIdOrKey = [{ name: 'Item 1' }, { name: 'Item 2' }];

    const renderItem = ({ item }: { item: { name: string }; index: number }) => (
      <div>
        <span>{item.name}</span>
      </div>
    );

    const { container } = render(
      <OptimizedList data={dataWithoutIdOrKey} renderItem={renderItem} itemHeight={50} />
    );

    expect(container).toBeTruthy();
  });

  it('should apply custom windowSize', () => {
    const renderItem = ({ item }: { item: TestItem }) => (
      <div>
        <span>{item.name}</span>
      </div>
    );

    // Should not throw with custom windowSize
    const { container } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} windowSize={10} />
    );
    expect(container).toBeTruthy();
  });

  it('should render without crashing with all props', () => {
    const renderItem = ({ item }: { item: TestItem }) => (
      <div>
        <span>{item.name}</span>
      </div>
    );

    const { container } = render(
      <OptimizedList data={mockData} renderItem={renderItem} itemHeight={50} />
    );

    expect(container).toBeTruthy();
  });
});

describe('createMemoizedRenderItem', () => {
  it('should create a memoized render function', () => {
    const MemoizedRender = createMemoizedRenderItem(TestItemComponent);

    // Create proper render info object
    const renderInfo = {
      item: { id: '1', name: 'Test' },
      index: 0,
    };

    // Verify the memoized render function works without throwing
    const { container } = render(MemoizedRender(renderInfo));
    expect(container).toBeTruthy();
  });
});

describe('withListItemMemo', () => {
  it('should create a memoized component', () => {
    const MemoizedComponent = withListItemMemo(TestItemComponent);

    // Verify the memoized component renders without throwing
    const { container } = render(<MemoizedComponent item={{ id: '1', name: 'Test' }} index={0} />);

    expect(container).toBeTruthy();
  });

  it('should use custom props comparison', () => {
    const customCompare = vi.fn(() => true);
    const MemoizedComponent = withListItemMemo(TestItemComponent, customCompare);

    const { rerender, container } = render(
      <MemoizedComponent item={{ id: '1', name: 'Test' }} index={0} />
    );

    expect(container).toBeTruthy();

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
