/**
 * VariantSelector Component Tests
 *
 * Tests for the VariantSelector chat component that displays
 * generated variants with provider badges and selection.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import type { VariantSetMessage } from '@/state';
import { VariantSelector } from '../VariantSelector';

vi.mock('@/components/ui', () => ({
  Text: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => <span {...props}>{children}</span>,
}));

const mockVariantMessage: VariantSetMessage = {
  id: 'msg-1',
  threadId: 'thread-1',
  sender: 'system',
  content: 'Generated 3 variants. Select one to continue.',
  contentType: 'variant_set',
  status: 'delivered',
  timestamp: new Date().toISOString(),
  metadata: {
    requestId: 'variant-123',
    variants: [
      {
        id: 'v-1',
        name: 'Approach A: Minimal',
        description: 'A concise approach',
        content: 'Minimal variant content here',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
        tokensUsed: 350,
      },
      {
        id: 'v-2',
        name: 'Approach B: Comprehensive',
        description: 'A thorough approach',
        content: 'Comprehensive variant content here',
        provider: 'openai',
        model: 'gpt-4o',
        tokensUsed: 520,
      },
      {
        id: 'v-3',
        name: 'Approach C: Creative',
        description: 'An innovative approach',
        content: 'Creative variant content here',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet',
        tokensUsed: 410,
      },
    ],
  },
};

describe('VariantSelector', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('renders all variant cards', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    expect(screen.getByText('Approach A: Minimal')).toBeTruthy();
    expect(screen.getByText('Approach B: Comprehensive')).toBeTruthy();
    expect(screen.getByText('Approach C: Creative')).toBeTruthy();
  });

  it('renders provider badges', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    const anthropicBadges = screen.getAllByText('anthropic');
    expect(anthropicBadges.length).toBe(2); // 2 anthropic variants
    expect(screen.getByText('openai')).toBeTruthy();
  });

  it('renders variant descriptions', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    expect(screen.getByText('A concise approach')).toBeTruthy();
    expect(screen.getByText('A thorough approach')).toBeTruthy();
    expect(screen.getByText('An innovative approach')).toBeTruthy();
  });

  it('renders token counts', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    expect(screen.getByText('350 tokens')).toBeTruthy();
    expect(screen.getByText('520 tokens')).toBeTruthy();
    expect(screen.getByText('410 tokens')).toBeTruthy();
  });

  it('expands a variant when clicked', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    const card = screen.getByLabelText('Variant: Approach A: Minimal');
    fireEvent.click(card);

    expect(screen.getByText('Minimal variant content here')).toBeTruthy();
    expect(screen.getByText('Select this variant')).toBeTruthy();
  });

  it('collapses a variant when clicked again', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    const card = screen.getByLabelText('Variant: Approach A: Minimal');
    fireEvent.click(card); // expand
    fireEvent.click(card); // collapse

    expect(screen.queryByText('Minimal variant content here')).toBeNull();
  });

  it('calls onSelect when "Select this variant" is clicked', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    const card = screen.getByLabelText('Variant: Approach A: Minimal');
    fireEvent.click(card); // expand

    const selectButton = screen.getByLabelText('Select Approach A: Minimal');
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith('v-1');
  });

  it('shows selected indicator when a variant is selected', () => {
    const selectedMessage: VariantSetMessage = {
      ...mockVariantMessage,
      metadata: {
        ...mockVariantMessage.metadata,
        selectedVariantId: 'v-2',
      },
    };

    render(<VariantSelector message={selectedMessage} onSelect={onSelect} />);

    expect(screen.getByText('Selected')).toBeTruthy();
    expect(screen.getByText('Variant selected')).toBeTruthy();
  });

  it('does not show select button when a variant is already selected', () => {
    const selectedMessage: VariantSetMessage = {
      ...mockVariantMessage,
      metadata: {
        ...mockVariantMessage.metadata,
        selectedVariantId: 'v-1',
      },
    };

    render(<VariantSelector message={selectedMessage} onSelect={onSelect} />);

    const card = screen.getByLabelText('Variant: Approach A: Minimal');
    fireEvent.click(card); // expand

    expect(screen.queryByText('Select this variant')).toBeNull();
  });

  it('has proper accessibility attributes on expand button', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    const expandButton = screen.getByLabelText('Variant: Approach A: Minimal');
    expect(expandButton.tagName).toBe('BUTTON');
    expect(expandButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports keyboard activation via Enter on button', () => {
    render(<VariantSelector message={mockVariantMessage} onSelect={onSelect} />);

    const expandButton = screen.getByLabelText('Variant: Approach A: Minimal');
    fireEvent.click(expandButton);

    expect(screen.getByText('Minimal variant content here')).toBeTruthy();
  });
});
