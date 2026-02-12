import { fireEvent, render } from '@testing-library/react-native';
import type { ApprovalMessage } from '@thumbcode/state';
import { ApprovalCard } from '../ApprovalCard';

jest.mock('@/components/icons', () => ({
  BranchIcon: () => 'BranchIcon',
  EditIcon: () => 'EditIcon',
  FileIcon: () => 'FileIcon',
  GitIcon: () => 'GitIcon',
  LightningIcon: () => 'LightningIcon',
}));

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { card: {}, badge: {}, button: {} },
}));

jest.mock('@/utils/design-tokens', () => ({
  getColor: jest.fn((_color: string, _shade?: string) => '#000000'),
}));

const createMessage = (
  overrides: Partial<ApprovalMessage['metadata']> = {}
): ApprovalMessage => ({
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
    const { toJSON } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Commit Changes');
    expect(json).toContain('Commit changes to main branch');
  });

  it('renders approve and reject buttons when pending', () => {
    const message = createMessage();
    const { toJSON } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Approve');
    expect(json).toContain('Reject');
  });

  it('calls onApprove when approve is pressed', () => {
    const onApprove = jest.fn();
    const message = createMessage();
    const { UNSAFE_getByProps } = render(
      <ApprovalCard message={message} onApprove={onApprove} onReject={jest.fn()} />
    );
    fireEvent.press(UNSAFE_getByProps({ accessibilityLabel: 'Approve' }));
    expect(onApprove).toHaveBeenCalled();
  });

  it('calls onReject when reject is pressed', () => {
    const onReject = jest.fn();
    const message = createMessage();
    const { UNSAFE_getByProps } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={onReject} />
    );
    fireEvent.press(UNSAFE_getByProps({ accessibilityLabel: 'Reject' }));
    expect(onReject).toHaveBeenCalled();
  });

  it('shows Approved badge when approved', () => {
    const message = createMessage({ approved: true, respondedAt: '2024-01-01T12:05:00Z' });
    const { toJSON } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Approved');
    // Should not show action buttons
    expect(json).not.toContain('"accessibilityLabel":"Approve"');
  });

  it('shows Rejected badge when rejected', () => {
    const message = createMessage({ approved: false, respondedAt: '2024-01-01T12:05:00Z' });
    const { toJSON } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Rejected');
  });

  it('renders correct label for push action type', () => {
    const message = createMessage({ actionType: 'push' });
    const { toJSON } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Push to Remote');
  });

  it('renders correct label for merge action type', () => {
    const message = createMessage({ actionType: 'merge' });
    const { toJSON } = render(
      <ApprovalCard message={message} onApprove={jest.fn()} onReject={jest.fn()} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Merge Branch');
  });
});
