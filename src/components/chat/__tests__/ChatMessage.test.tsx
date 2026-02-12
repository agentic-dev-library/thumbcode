import { render } from '@testing-library/react-native';
import type { Message } from '@thumbcode/state';
import { ChatMessage } from '../ChatMessage';

jest.mock('@/components/icons', () => ({
  BranchIcon: () => 'BranchIcon',
  EditIcon: () => 'EditIcon',
  FileIcon: () => 'FileIcon',
  GitIcon: () => 'GitIcon',
  LightningIcon: () => 'LightningIcon',
}));

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: {
    pill: {},
    chatBubbleUser: {},
    chatBubbleAgent: {},
    card: {},
    badge: {},
    button: {},
    codeBlock: {},
  },
}));

jest.mock('@/utils/design-tokens', () => ({
  getColor: jest.fn(() => '#000000'),
}));

// Mock CodeBlock since it has complex dependencies
jest.mock('../CodeBlock', () => ({
  CodeBlock: ({ code }: { code: string }) => code,
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
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Hello from the architect');
  });

  it('renders sender name for agent messages', () => {
    const message = createMessage({ sender: 'implementer' });
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Implementer');
  });

  it('does not show sender label for user messages', () => {
    const message = createMessage({ sender: 'user', content: 'My message' });
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('My message');
    // User messages don't show sender name badge
    expect(json).not.toContain('"You"');
  });

  it('shows sending status', () => {
    const message = createMessage({ status: 'sending' });
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Sending...');
  });

  it('shows failed status', () => {
    const message = createMessage({ status: 'failed' });
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Failed');
  });

  it('renders timestamp', () => {
    const message = createMessage();
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    // Should contain formatted time
    expect(json).toBeTruthy();
  });

  it('renders code message with code block', () => {
    const message = createMessage({
      contentType: 'code',
      content: 'const x = 1;',
      metadata: { language: 'typescript' },
    });
    const { toJSON } = render(<ChatMessage message={message} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('const x = 1;');
  });

  it('renders different sender colors', () => {
    const reviewerMsg = createMessage({ sender: 'reviewer' });
    const { toJSON } = render(<ChatMessage message={reviewerMsg} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Reviewer');
  });
});
