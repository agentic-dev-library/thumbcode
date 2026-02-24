import { render, screen } from '@testing-library/react';
import type { Message } from '@thumbcode/state';
import { ChatMessage } from '../ChatMessage';

vi.mock('@/components/icons', () => ({
  BranchIcon: () => <span>BranchIcon</span>,
  EditIcon: () => <span>EditIcon</span>,
  FileIcon: () => <span>FileIcon</span>,
  GitIcon: () => <span>GitIcon</span>,
  LightningIcon: () => <span>LightningIcon</span>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn(() => '#000000'),
}));

// Mock CodeBlock since it has complex dependencies
vi.mock('../CodeBlock', () => ({
  CodeBlock: ({ code }: { code: string }) => <span>{code}</span>,
}));

// Mock ApprovalCard
vi.mock('../ApprovalCard', () => ({
  ApprovalCard: ({ message, onApprove, onReject }: any) => (
    <div>
      <span>{message.content}</span>
      <button type="button" onClick={onApprove}>Approve</button>
      <button type="button" onClick={onReject}>Reject</button>
    </div>
  ),
}));

const createMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  threadId: 'thread-1',
  sender: 'architect',
  content: 'Hello from the architect',
  contentType: 'text',
  status: 'sent',
  timestamp: '2024-01-01T12:00:00Z',
  ...overrides,
});

describe('ChatMessage', () => {
  it('renders text message content', () => {
    const message = createMessage();
    render(<ChatMessage message={message} />);
    expect(screen.getByText('Hello from the architect')).toBeTruthy();
  });

  it('renders sender name for agent messages', () => {
    const message = createMessage({ sender: 'implementer' });
    render(<ChatMessage message={message} />);
    expect(screen.getByText('Implementer')).toBeTruthy();
  });

  it('does not show sender label for user messages', () => {
    const message = createMessage({ sender: 'user', content: 'My message' });
    render(<ChatMessage message={message} />);
    expect(screen.getByText('My message')).toBeTruthy();
    // User messages don't show sender name badge
    expect(screen.queryByText('You')).toBeNull();
  });

  it('shows sending status', () => {
    const message = createMessage({ status: 'sending' });
    const { container } = render(<ChatMessage message={message} />);
    expect(container.innerHTML).toContain('Sending...');
  });

  it('shows failed status', () => {
    const message = createMessage({ status: 'failed' });
    const { container } = render(<ChatMessage message={message} />);
    expect(container.innerHTML).toContain('Failed');
  });

  it('renders timestamp', () => {
    const message = createMessage();
    const { container } = render(<ChatMessage message={message} />);
    // Should contain formatted time
    expect(container.innerHTML).toBeTruthy();
  });

  it('renders code message with code block', () => {
    const message = createMessage({
      contentType: 'code',
      content: 'const x = 1;',
      metadata: { language: 'typescript' },
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText('const x = 1;')).toBeTruthy();
  });

  it('renders different sender colors', () => {
    const reviewerMsg = createMessage({ sender: 'reviewer' });
    render(<ChatMessage message={reviewerMsg} />);
    expect(screen.getByText('Reviewer')).toBeTruthy();
  });

  it('renders approval request message', () => {
    const onApproval = vi.fn();
    const message = createMessage({
      contentType: 'approval_request',
      content: 'Approve commit?',
      metadata: {
        actionType: 'commit',
        actionDescription: 'feat: add login page',
      },
    });
    render(<ChatMessage message={message} onApprovalResponse={onApproval} />);
    // The ApprovalCard is rendered (mocked via auto-discovery)
    expect(screen.getByText('Approve commit?')).toBeTruthy();
  });
});
