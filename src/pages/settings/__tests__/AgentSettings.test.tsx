/**
 * AgentSettings Page Tests
 *
 * Verifies the agent settings page renders automation toggles,
 * approval level selectors, and advanced settings.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentSettings } from '../AgentSettings';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('AgentSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    render(<AgentSettings />);
    expect(screen.getByText('Agent Settings')).toBeInTheDocument();
  });

  it('renders automation section with toggle settings', () => {
    render(<AgentSettings />);
    expect(screen.getByText('AUTOMATION')).toBeInTheDocument();
    expect(screen.getByText('Auto-Review')).toBeInTheDocument();
    expect(screen.getByText('Auto-Test')).toBeInTheDocument();
    expect(screen.getByText('Parallel Execution')).toBeInTheDocument();
  });

  it('renders approval requirements section', () => {
    render(<AgentSettings />);
    expect(screen.getByText('APPROVAL REQUIREMENTS')).toBeInTheDocument();
    expect(screen.getByText('Commits')).toBeInTheDocument();
    expect(screen.getByText('Push to Remote')).toBeInTheDocument();
    expect(screen.getByText('Deployments')).toBeInTheDocument();
  });

  it('renders approval level options for each category', () => {
    render(<AgentSettings />);
    // Each approval selector has 3 levels, and there are 3 selectors = 9 buttons
    const autoButtons = screen.getAllByText('Automatic');
    const notifyButtons = screen.getAllByText('Notify Only');
    const requireButtons = screen.getAllByText('Require Approval');
    expect(autoButtons).toHaveLength(3);
    expect(notifyButtons).toHaveLength(3);
    expect(requireButtons).toHaveLength(3);
  });

  it('defaults to "Require Approval" for all approval categories', () => {
    render(<AgentSettings />);
    // "Require Approval" is selected by default - each selected button has coral border
    const requireButtons = screen.getAllByText('Require Approval');
    for (const btn of requireButtons) {
      // The parent button should have the coral-500 class when selected
      expect(btn.closest('button')).toHaveClass('border-coral-500');
    }
  });

  it('changes approval level when clicking a different option', () => {
    render(<AgentSettings />);
    const automaticButtons = screen.getAllByText('Automatic');
    // Click "Automatic" for the first approval category (Commits)
    fireEvent.click(automaticButtons[0]);
    expect(automaticButtons[0].closest('button')).toHaveClass('border-coral-500');
  });

  it('renders advanced section with verbose logging toggle', () => {
    render(<AgentSettings />);
    expect(screen.getByText('ADVANCED')).toBeInTheDocument();
    expect(screen.getByText('Verbose Logging')).toBeInTheDocument();
  });

  it('renders the tip info box', () => {
    render(<AgentSettings />);
    expect(screen.getByText('Tip')).toBeInTheDocument();
    expect(
      screen.getByText(/Start with "Require Approval" for all actions/)
    ).toBeInTheDocument();
  });

  it('toggles auto-review switch', () => {
    render(<AgentSettings />);
    const switches = screen.getAllByRole('switch');
    // Auto-Review is the first toggle, should be on by default
    expect(switches[0]).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(switches[0]);
    expect(switches[0]).toHaveAttribute('aria-checked', 'false');
  });

  it('navigates back to settings when clicking back button', () => {
    render(<AgentSettings />);
    fireEvent.click(screen.getByLabelText('Back to settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('renders the Recommended badge on Auto-Review', () => {
    render(<AgentSettings />);
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });
});
