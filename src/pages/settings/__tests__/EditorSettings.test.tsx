/**
 * EditorSettings Page Tests
 *
 * Verifies the editor settings page renders appearance options,
 * formatting toggles, behavior settings, and a code preview.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorSettings } from '../EditorSettings';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('EditorSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    render(<EditorSettings />);
    expect(screen.getByText('Editor Settings')).toBeInTheDocument();
  });

  it('renders appearance section with theme options', () => {
    render(<EditorSettings />);
    expect(screen.getByText('APPEARANCE')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
  });

  it('renders font size options', () => {
    render(<EditorSettings />);
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders formatting section with tab size options', () => {
    render(<EditorSettings />);
    expect(screen.getByText('FORMATTING')).toBeInTheDocument();
    expect(screen.getByText('Tab Size')).toBeInTheDocument();
    expect(screen.getByText('2 spaces')).toBeInTheDocument();
    expect(screen.getByText('4 spaces')).toBeInTheDocument();
    expect(screen.getByText('Tab')).toBeInTheDocument();
  });

  it('renders toggle settings for line numbers, minimap, word wrap', () => {
    render(<EditorSettings />);
    expect(screen.getByText('Line Numbers')).toBeInTheDocument();
    expect(screen.getByText('Minimap')).toBeInTheDocument();
    expect(screen.getByText('Word Wrap')).toBeInTheDocument();
    expect(screen.getByText('Format on Save')).toBeInTheDocument();
    expect(screen.getByText('Bracket Pair Colors')).toBeInTheDocument();
  });

  it('renders behavior section with auto save toggle', () => {
    render(<EditorSettings />);
    expect(screen.getByText('BEHAVIOR')).toBeInTheDocument();
    expect(screen.getByText('Auto Save')).toBeInTheDocument();
  });

  it('renders code preview section', () => {
    render(<EditorSettings />);
    expect(screen.getByText('PREVIEW')).toBeInTheDocument();
    // Preview shows line numbers by default
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('toggles line numbers switch', () => {
    render(<EditorSettings />);
    const switches = screen.getAllByRole('switch');
    // Line Numbers is the first toggle in appearance section (after theme and font size selectors)
    // Find the one that starts checked (line numbers defaults to true)
    const lineNumbersSwitch = switches[0]; // Line Numbers
    expect(lineNumbersSwitch).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(lineNumbersSwitch);
    expect(lineNumbersSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('selects a different theme', () => {
    render(<EditorSettings />);
    const lightButton = screen.getByText('Light');
    fireEvent.click(lightButton);
    // Light button should now be selected (coral background)
    expect(lightButton.closest('button')).toHaveClass('bg-coral-500');
  });

  it('selects a different font size', () => {
    render(<EditorSettings />);
    const size16Button = screen.getByText('16');
    fireEvent.click(size16Button);
    expect(size16Button.closest('button')).toHaveClass('bg-coral-500');
  });

  it('navigates back to settings when clicking back button', () => {
    render(<EditorSettings />);
    fireEvent.click(screen.getByLabelText('Back to settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });
});
