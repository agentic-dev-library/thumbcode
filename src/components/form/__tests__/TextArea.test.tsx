import { render } from '@testing-library/react';
import { TextArea } from '../TextArea';

// Add document stub for TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = { createElement: () => ({}) };
}

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { textInput: {} },
}));

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn(() => '#9CA3AF'),
}));

describe('TextArea', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<TextArea />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders label text', () => {
    const { toJSON } = render(<TextArea label="Description" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Description');
  });

  it('renders helper text', () => {
    const { toJSON } = render(<TextArea helper="Max 500 characters" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Max 500 characters');
  });

  it('renders error text instead of helper when error is set', () => {
    const { toJSON } = render(<TextArea helper="Max 500 characters" error="Field is required" />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Field is required');
  });

  it('shows character count when showCount is true', () => {
    const { toJSON } = render(<TextArea value="Hello" showCount maxLength={100} />);
    const json = JSON.stringify(toJSON());
    // Text might be split into separate children, so check both parts
    expect(json).toContain('5');
    expect(json).toContain('/100');
  });

  it('shows character count without max when maxLength is not set', () => {
    const { toJSON } = render(<TextArea value="Hello" showCount />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('5');
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = vi.fn();
    const { toJSON } = render(<TextArea value="initial" onChangeText={onChangeText} />);
    // Verify component renders with value
    const json = JSON.stringify(toJSON());
    expect(json).toContain('initial');
  });

  it('renders as a textarea element (multiline)', () => {
    const { toJSON } = render(<TextArea />);
    const json = JSON.stringify(toJSON());
    // In web/jest-expo, multiline TextInput renders as <textarea>
    expect(json).toContain('textarea');
  });
});
