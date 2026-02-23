import { fireEvent, render, screen } from '@testing-library/react';
import { ChatInput } from '../ChatInput';

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn(() => '#9CA3AF'),
}));

vi.mock('@/services/chat', () => ({
  ChatService: {
    sendMessage: vi.fn(),
  },
}));

describe('ChatInput', () => {
  it('renders with default placeholder', () => {
    render(<ChatInput threadId="thread-1" />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    render(<ChatInput threadId="thread-1" placeholder="Ask the architect..." />);
    expect(screen.getByPlaceholderText('Ask the architect...')).toBeTruthy();
  });

  it('renders send button', () => {
    render(<ChatInput threadId="thread-1" />);
    expect(screen.getByText('Send')).toBeTruthy();
  });

  it('renders message input with accessibility label', () => {
    render(<ChatInput threadId="thread-1" />);
    expect(screen.getByLabelText('Message input')).toBeTruthy();
  });

  it('renders send button with accessibility attributes', () => {
    render(<ChatInput threadId="thread-1" />);
    expect(screen.getByLabelText('Send')).toBeTruthy();
  });

  describe('variant toggle', () => {
    it('renders variant toggle button', () => {
      render(<ChatInput threadId="thread-1" />);
      expect(screen.getByLabelText('Toggle variant mode')).toBeTruthy();
    });

    it('variant toggle starts as not pressed', () => {
      render(<ChatInput threadId="thread-1" />);
      const toggle = screen.getByLabelText('Toggle variant mode');
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('toggles variant mode when clicked', () => {
      render(<ChatInput threadId="thread-1" />);
      const toggle = screen.getByLabelText('Toggle variant mode');

      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-pressed')).toBe('true');

      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('shows variant mode indicator when active', () => {
      render(<ChatInput threadId="thread-1" />);
      const toggle = screen.getByLabelText('Toggle variant mode');

      fireEvent.click(toggle);
      expect(screen.getByText(/Variants mode/)).toBeTruthy();
    });

    it('changes placeholder when variant mode is active', () => {
      render(<ChatInput threadId="thread-1" />);
      const toggle = screen.getByLabelText('Toggle variant mode');

      fireEvent.click(toggle);
      expect(screen.getByPlaceholderText('Describe what you want variants for...')).toBeTruthy();
    });
  });
});
