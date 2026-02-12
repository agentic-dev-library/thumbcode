import { fireEvent, render, screen } from '@testing-library/react';
import type { ApprovalMessage } from '@thumbcode/state';
import { ApprovalCard } from '../ApprovalCard';

vi.mock('@/components/icons', () => ({
  BranchIcon: () => 'BranchIcon',
  EditIcon: () => 'EditIcon',
  FileIcon: () => 'FileIcon',
  GitIcon: () => 'GitIcon',
  LightningIcon: () => 'LightningIcon',
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { card: {}, badge: {}, button: {} },
}));

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn((_color: string, _shade?: string) => '#000000'),
}));

const createMessage = (overrides: Partial<ApprovalMessage['metadata']> = {}): ApprovalMessage => ({
  id: 'msg-1',
  threadId: 'thread-1',
  sender: 'architect',
  content: 'Requesting approval',
  contentType: 'approval_request',
  status: 'sent',
  timestamp: '2024-01-01T12:00:00Z',
  metadata: {
    actionType: 'commit',
    actionDescription: 'Commit changes to main branch',
    ...overrides,
  },
});

describe('ApprovalCard', () => {
  it('renders pending approval with action label', () => {
    const message = createMessage();
    const { container } = render(
      <ApprovalCard message={message} onApprove={vi.fn()} onReject={vi.fn()} />
    );
    expect(container.innerHTML).toContain('Commit Changes');
    expect(container.innerHTML).toContain('Commit changes to main branch');
  });

  it('renders approve and reject buttons when pending', () => {
    const message = createMessage();
    const { container } = render(
      <ApprovalCard message={message} onApprove={vi.fn()} onReject={vi.fn()} />
    );
    expect(container.innerHTML).toContain('Approve');
    expect(container.innerHTML).toContain('Reject');
  });

  it('calls onApprove when approve is pressed', () => {
    const onApprove = vi.fn();
    const message = createMessage();
    render(<ApprovalCard message={message} onApprove={onApprove} onReject={vi.fn()} />);
    fireEvent.click(screen.getByText('Approve'));
    expect(onApprove).toHaveBeenCalled();
  });

  it('calls onReject when reject is pressed', () => {
    const onReject = vi.fn();
    const message = createMessage();
    render(<ApprovalCard message={message} onApprove={vi.fn()} onReject={onReject} />);
    fireEvent.click(screen.getByText('Reject'));
    expect(onReject).toHaveBeenCalled();
  });

  it('shows Approved badge when approved', () => {
    const message = createMessage({ approved: true, respondedAt: '2024-01-01T12:05:00Z' });
    const { container } = render(
      <ApprovalCard message={message} onApprove={vi.fn()} onReject={vi.fn()} />
    );
    expect(container.innerHTML).toContain('Approved');
  });

  it('shows Rejected badge when rejected', () => {
    const message = createMessage({ approved: false, respondedAt: '2024-01-01T12:05:00Z' });
    const { container } = render(
      <ApprovalCard message={message} onApprove={vi.fn()} onReject={vi.fn()} />
    );
    expect(container.innerHTML).toContain('Rejected');
  });

  it('renders correct label for push action type', () => {
    const message = createMessage({ actionType: 'push' });
    const { container } = render(
      <ApprovalCard message={message} onApprove={vi.fn()} onReject={vi.fn()} />
    );
    expect(container.innerHTML).toContain('Push to Remote');
  });

  it('renders correct label for merge action type', () => {
    const message = createMessage({ actionType: 'merge' });
    const { container } = render(
      <ApprovalCard message={message} onApprove={vi.fn()} onReject={vi.fn()} />
    );
    expect(container.innerHTML).toContain('Merge Branch');
  });
});
