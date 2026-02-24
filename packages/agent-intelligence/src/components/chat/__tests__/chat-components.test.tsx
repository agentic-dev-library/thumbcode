import { fireEvent, render, screen } from '@testing-library/react';
import ActionButton from '../ActionButton';
import ChatBubble from '../ChatBubble';
import ChatInput from '../ChatInput';
import CodeBlock from '../CodeBlock';

const mockAddMessage = vi.fn();
vi.mock('@thumbcode/state', () => ({
  useChatStore: vi.fn((selector: any) =>
    selector({
      addMessage: mockAddMessage,
    })
  ),
}));

describe('ActionButton', () => {
  it('renders title text', () => {
    render(<ActionButton title="Approve" onPress={vi.fn()} />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(<ActionButton title="Click" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledOnce();
  });
});

describe('ChatBubble', () => {
  const baseMessage = {
    id: 'msg-1',
    threadId: 't-1',
    content: 'Hello',
    contentType: 'text' as const,
    status: 'sent' as const,
    timestamp: '2024-01-01T12:00:00Z',
  };

  it('renders user message', () => {
    render(<ChatBubble message={{ ...baseMessage, sender: 'user' }} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies user styling for user sender', () => {
    const { container } = render(
      <ChatBubble message={{ ...baseMessage, sender: 'user' }} />
    );
    const bubble = container.firstChild as HTMLElement;
    expect(bubble.className).toContain('self-end');
  });

  it('applies agent styling for agent sender', () => {
    const { container } = render(
      <ChatBubble message={{ ...baseMessage, sender: 'architect' }} />
    );
    const bubble = container.firstChild as HTMLElement;
    expect(bubble.className).toContain('self-start');
  });
});

describe('ChatInput', () => {
  beforeEach(() => mockAddMessage.mockClear());

  it('renders input and send button', () => {
    render(<ChatInput />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('calls addMessage when Send is clicked with text', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello agent' } });
    fireEvent.click(screen.getByText('Send'));
    expect(mockAddMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Hello agent',
        sender: 'user',
        contentType: 'text',
      })
    );
  });

  it('does not send empty messages', () => {
    render(<ChatInput />);
    fireEvent.click(screen.getByText('Send'));
    expect(mockAddMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send'));
    expect(input.value).toBe('');
  });
});

describe('CodeBlock (agent-intelligence)', () => {
  it('renders code content', () => {
    render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders language label when provided', () => {
    render(<CodeBlock code="print('hi')" language="python" />);
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('does not render language label when not provided', () => {
    render(<CodeBlock code="test" />);
    expect(screen.queryByText('python')).not.toBeInTheDocument();
  });
});
