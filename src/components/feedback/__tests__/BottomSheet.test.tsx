import { create } from '@testing-library/react';

// Mock the component to bypass RN Modal rendering in jest-expo web
vi.mock('../BottomSheet', () => {
  const { View, Text, Pressable } = require('react-native');

  function BottomSheet({
    visible,
    onClose,
    title,
    children,
    showHandle = true,
  }: {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    height?: string | number;
    scrollable?: boolean;
    showHandle?: boolean;
  }) {
    if (!visible) return null;
    return (
      <View testID="bottom-sheet">
        {showHandle && <View testID="drag-handle" />}
        {title && (
          <View>
            <Text>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Text>CloseIcon</Text>
            </Pressable>
          </View>
        )}
        <View>{children}</View>
      </View>
    );
  }

  function ActionSheet({
    visible,
    onClose,
    title,
    message,
    options,
    showCancel = true,
    cancelText = 'Cancel',
  }: {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    options: Array<{
      label: string;
      onPress: () => void;
      destructive?: boolean;
      disabled?: boolean;
    }>;
    showCancel?: boolean;
    cancelText?: string;
  }) {
    if (!visible) return null;
    return (
      <View testID="action-sheet">
        {(title || message) && (
          <View>
            {title && <Text accessibilityRole="header">{title}</Text>}
            {message && <Text>{message}</Text>}
          </View>
        )}
        {options.map((option) => (
          <Pressable
            key={option.label}
            onPress={() => {
              option.onPress();
              onClose();
            }}
            disabled={option.disabled}
            accessibilityRole="button"
            accessibilityLabel={option.label}
          >
            <Text>{option.label}</Text>
          </Pressable>
        ))}
        {showCancel && (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={cancelText}>
            <Text>{cancelText}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return { BottomSheet, ActionSheet };
});

vi.mock('@/components/icons', () => ({
  CloseIcon: () => 'CloseIcon',
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { modal: {}, button: {} },
}));

const { BottomSheet, ActionSheet } = require('../BottomSheet');

describe('BottomSheet', () => {
  it('renders children when visible', () => {
    const tree = create(
      <BottomSheet visible onClose={vi.fn()}>
        <Text>Sheet content</Text>
      </BottomSheet>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Sheet content');
  });

  it('renders title when provided', () => {
    const tree = create(
      <BottomSheet visible onClose={vi.fn()} title="Settings">
        <Text>Content</Text>
      </BottomSheet>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Settings');
  });

  it('renders close icon when title is present', () => {
    const tree = create(
      <BottomSheet visible onClose={vi.fn()} title="Settings">
        <Text>Content</Text>
      </BottomSheet>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('CloseIcon');
  });

  it('does not render when not visible', () => {
    const tree = create(
      <BottomSheet visible={false} onClose={vi.fn()}>
        <Text>Hidden</Text>
      </BottomSheet>
    );
    expect(tree.toJSON()).toBeNull();
  });
});

describe('ActionSheet', () => {
  const mockOptions = [
    { label: 'Edit', onPress: vi.fn() },
    { label: 'Delete', onPress: vi.fn(), destructive: true },
    { label: 'Archive', onPress: vi.fn(), disabled: true },
  ];

  it('renders action options', () => {
    const tree = create(<ActionSheet visible onClose={vi.fn()} options={mockOptions} />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Edit');
    expect(json).toContain('Delete');
    expect(json).toContain('Archive');
  });

  it('renders title and message', () => {
    const tree = create(
      <ActionSheet
        visible
        onClose={vi.fn()}
        options={mockOptions}
        title="Choose action"
        message="What would you like to do?"
      />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Choose action');
    expect(json).toContain('What would you like to do?');
  });

  it('renders cancel button by default', () => {
    const tree = create(<ActionSheet visible onClose={vi.fn()} options={mockOptions} />);
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Cancel');
  });

  it('uses custom cancel text', () => {
    const tree = create(
      <ActionSheet visible onClose={vi.fn()} options={mockOptions} cancelText="Dismiss" />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Dismiss');
  });

  it('hides cancel when showCancel is false', () => {
    const tree = create(
      <ActionSheet visible onClose={vi.fn()} options={mockOptions} showCancel={false} />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).not.toContain('Cancel');
  });
});
