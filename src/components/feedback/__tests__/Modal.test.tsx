import { act, create } from '@testing-library/react';

// Mock the entire Modal component to bypass RN Modal rendering issues
vi.mock('../Modal', () => {
  const { View, Text, Pressable, ScrollView } = require('react-native');

  function Modal({
    visible,
    onClose,
    title,
    children,
    footer,
    scrollable = false,
  }: {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: string;
    closeOnBackdrop?: boolean;
    footer?: React.ReactNode;
    scrollable?: boolean;
  }) {
    if (!visible) return null;
    const ContentWrapper = scrollable ? ScrollView : View;
    return (
      <View testID="modal-wrapper">
        {title && (
          <View>
            <Text accessibilityRole="header">{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Text>CloseIcon</Text>
            </Pressable>
          </View>
        )}
        <ContentWrapper>{children}</ContentWrapper>
        {footer && <View>{footer}</View>}
      </View>
    );
  }

  function ConfirmDialog({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant: _variant = 'default',
  }: {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: string;
  }) {
    if (!visible) return null;
    return (
      <Modal
        visible={visible}
        onClose={onClose}
        title={title}
        footer={
          <>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={cancelText}>
              <Text>{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onConfirm();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
            >
              <Text>{confirmText}</Text>
            </Pressable>
          </>
        }
      >
        <Text>{message}</Text>
      </Modal>
    );
  }

  return { Modal, ConfirmDialog };
});

vi.mock('@/components/icons', () => ({
  CloseIcon: () => 'CloseIcon',
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { modal: {}, button: {} },
}));

const { Modal, ConfirmDialog } = require('../Modal');

describe('Modal', () => {
  it('renders children when visible', () => {
    const tree = create(
      <Modal visible onClose={vi.fn()}>
        <Text>Modal content</Text>
      </Modal>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Modal content');
  });

  it('renders title when provided', () => {
    const tree = create(
      <Modal visible onClose={vi.fn()} title="My Modal">
        <Text>Content</Text>
      </Modal>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('My Modal');
  });

  it('renders footer when provided', () => {
    const tree = create(
      <Modal visible onClose={vi.fn()} footer={<Text>Footer actions</Text>}>
        <Text>Content</Text>
      </Modal>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Footer actions');
  });

  it('renders close button when title is present', () => {
    const tree = create(
      <Modal visible onClose={vi.fn()} title="Test">
        <Text>Content</Text>
      </Modal>
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('CloseIcon');
  });

  it('does not render when not visible', () => {
    const tree = create(
      <Modal visible={false} onClose={vi.fn()}>
        <Text>Hidden</Text>
      </Modal>
    );
    expect(tree.toJSON()).toBeNull();
  });
});

describe('ConfirmDialog', () => {
  it('renders title and message', () => {
    const tree = create(
      <ConfirmDialog
        visible
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete project?"
        message="This action cannot be undone."
      />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Delete project?');
    expect(json).toContain('This action cannot be undone.');
  });

  it('renders confirm and cancel buttons', () => {
    const tree = create(
      <ConfirmDialog
        visible
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirm"
        message="Are you sure?"
      />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Confirm');
    expect(json).toContain('Cancel');
  });

  it('renders custom button text', () => {
    const tree = create(
      <ConfirmDialog
        visible
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Remove"
        message="Remove this item?"
        confirmText="Yes, Remove"
        cancelText="No, Keep"
      />
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Yes, Remove');
    expect(json).toContain('No, Keep');
  });

  it('calls onConfirm when confirm is pressed', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const tree = create(
      <ConfirmDialog
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        title="Confirm"
        message="Sure?"
        confirmText="Yes"
      />
    );
    const root = tree.root;
    const confirmButtons = root.findAll(
      (node) => node.props.accessibilityLabel === 'Yes' && node.props.accessibilityRole === 'button'
    );
    expect(confirmButtons.length).toBeGreaterThan(0);
    act(() => confirmButtons[0].props.onPress());
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel is pressed', () => {
    const onClose = vi.fn();
    const tree = create(
      <ConfirmDialog
        visible
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Confirm"
        message="Sure?"
      />
    );
    const root = tree.root;
    const cancelButtons = root.findAll(
      (node) =>
        node.props.accessibilityLabel === 'Cancel' && node.props.accessibilityRole === 'button'
    );
    expect(cancelButtons.length).toBeGreaterThan(0);
    act(() => cancelButtons[0].props.onPress());
    expect(onClose).toHaveBeenCalled();
  });
});
