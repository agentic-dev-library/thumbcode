/**
 * Complete (Onboarding) Page Tests
 *
 * Verifies the onboarding completion page renders the celebration UI,
 * capability list, and handles the "Start Building" navigation.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CompletePage from '../complete';

const mockReplace = vi.fn();
vi.mock('@/hooks/useAppRouter', () => ({
  useAppRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
  }),
}));

const mockCompleteOnboarding = vi.fn().mockResolvedValue(undefined);
vi.mock('@/contexts/onboarding', () => ({
  useOnboarding: () => ({
    completeOnboarding: mockCompleteOnboarding,
  }),
}));

vi.mock('@/components/icons', () => ({
  AgentIcon: () => <div data-testid="agent-icon" />,
  CelebrateIcon: () => <div data-testid="celebrate-icon" />,
  ChatIcon: () => <div data-testid="chat-icon" />,
  MobileIcon: () => <div data-testid="mobile-icon" />,
  SuccessIcon: () => <div data-testid="success-icon" />,
  TasksIcon: () => <div data-testid="tasks-icon" />,
}));

describe('CompletePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the completion heading', () => {
    render(<CompletePage />);
    expect(screen.getByText("You're All Set!")).toBeInTheDocument();
  });

  it('renders the subtitle message', () => {
    render(<CompletePage />);
    expect(
      screen.getByText('ThumbCode is ready. Start building amazing apps with your AI team.')
    ).toBeInTheDocument();
  });

  it('renders all four capabilities', () => {
    render(<CompletePage />);
    expect(screen.getByText('AI Agent Teams')).toBeInTheDocument();
    expect(screen.getByText('Mobile Git')).toBeInTheDocument();
    expect(screen.getByText('Real-time Chat')).toBeInTheDocument();
    expect(screen.getByText('Progress Tracking')).toBeInTheDocument();
  });

  it('renders capability descriptions', () => {
    render(<CompletePage />);
    expect(screen.getByText('Multi-agent collaboration ready')).toBeInTheDocument();
    expect(screen.getByText('Clone, commit, push from your phone')).toBeInTheDocument();
    expect(screen.getByText('Direct agent communication')).toBeInTheDocument();
    expect(screen.getByText('Monitor tasks and metrics')).toBeInTheDocument();
  });

  it('has the complete-screen test id', () => {
    render(<CompletePage />);
    expect(screen.getByTestId('complete-screen')).toBeInTheDocument();
  });

  it('has the Start Building button', () => {
    render(<CompletePage />);
    expect(screen.getByTestId('start-building-button')).toBeInTheDocument();
  });

  it('calls completeOnboarding and navigates to "/" on Start Building click', async () => {
    render(<CompletePage />);
    fireEvent.click(screen.getByTestId('start-building-button'));

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('renders celebration icon', () => {
    render(<CompletePage />);
    expect(screen.getByTestId('celebrate-icon')).toBeInTheDocument();
  });
});
