import { fireEvent, render, screen } from '@testing-library/react';
import { ConfirmDialog, Modal } from '../Modal';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
}));

// Mock HTMLDialogElement methods since jsdom doesn't fully support <dialog>
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

describe('Modal', () => {
  it('renders children when visible', () => {
    render(
      <Modal visible onClose={vi.fn()}>
        <span>Modal content</span>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeTruthy();
  });

  it('renders title when provided', () => {
    render(
      <Modal visible onClose={vi.fn()} title="My Modal">
        <span>Content</span>
      </Modal>
    );
    expect(screen.getByText('My Modal')).toBeTruthy();
  });

  it('renders footer when provided', () => {
    render(
      <Modal visible onClose={vi.fn()} footer={<span>Footer actions</span>}>
        <span>Content</span>
      </Modal>
    );
    expect(screen.getByText('Footer actions')).toBeTruthy();
  });

  it('renders close button when title is present', () => {
    render(
      <Modal visible onClose={vi.fn()} title="Test">
        <span>Content</span>
      </Modal>
    );
    expect(screen.getByLabelText('Close')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    render(
      <Modal visible={false} onClose={vi.fn()}>
        <span>Hidden</span>
      </Modal>
    );
    // The dialog element is in DOM but not open
    const dialog = document.querySelector('dialog');
    expect(dialog?.hasAttribute('open')).toBeFalsy();
  });
});

describe('ConfirmDialog', () => {
  it('renders title and message', () => {
    render(
      <ConfirmDialog
        visible
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete project?"
        message="This action cannot be undone."
      />
    );
    expect(screen.getByText('Delete project?')).toBeTruthy();
    expect(screen.getByText('This action cannot be undone.')).toBeTruthy();
  });

  it('renders confirm and cancel buttons', () => {
    render(
      <ConfirmDialog
        visible
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirm"
        message="Are you sure?"
      />
    );
    expect(screen.getByLabelText('Confirm')).toBeTruthy();
    expect(screen.getByLabelText('Cancel')).toBeTruthy();
  });

  it('renders custom button text', () => {
    render(
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
    expect(screen.getByText('Yes, Remove')).toBeTruthy();
    expect(screen.getByText('No, Keep')).toBeTruthy();
  });

  it('calls onConfirm when confirm is pressed', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        title="Confirm"
        message="Sure?"
        confirmText="Yes"
      />
    );
    fireEvent.click(screen.getByLabelText('Yes'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel is pressed', () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        visible
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Confirm"
        message="Sure?"
      />
    );
    fireEvent.click(screen.getByLabelText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
