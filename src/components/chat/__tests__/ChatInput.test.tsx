import { render } from '@testing-library/react';
import { ChatInput } from '../ChatInput';

// Add document stub for TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = { createElement: () => ({}) };
}

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { textInput: {}, button: {} },
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
    const { toJSON } = render(<ChatInput threadId="thread-1" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Type a message...');
  });

  it('renders with custom placeholder', () => {
    const { toJSON } = render(<ChatInput threadId="thread-1" placeholder="Ask the architect..." />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Ask the architect...');
  });

  it('renders send button', () => {
    const { toJSON } = render(<ChatInput threadId="thread-1" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Send');
  });

  it('renders message input with accessibility label', () => {
    const { toJSON } = render(<ChatInput threadId="thread-1" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Message input');
  });

  it('renders send button with accessibility attributes', () => {
    const { toJSON } = render(<ChatInput threadId="thread-1" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"aria-label":"Send"');
  });
});
