import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WelcomePage from '../welcome';

// Mock useAppRouter
const mockPush = vi.fn();
vi.mock('@/hooks/use-app-router', () => ({
  useAppRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('WelcomePage', () => {
  it('renders hero section with ThumbCode branding', () => {
    render(<WelcomePage />);

    expect(screen.getByText('ThumbCode')).toBeInTheDocument();
    expect(
      screen.getByText('Code with your thumbs. Ship apps from your phone.')
    ).toBeInTheDocument();
  });

  it('renders three feature pills', () => {
    render(<WelcomePage />);

    expect(screen.getByText(/AI Agent Teams/)).toBeInTheDocument();
    expect(screen.getByText(/Mobile-First Git/)).toBeInTheDocument();
    expect(screen.getByText(/Your Keys, Your Device/)).toBeInTheDocument();
  });

  it('navigates to setup on Get Started click', () => {
    render(<WelcomePage />);

    fireEvent.click(screen.getByTestId('get-started-button'));

    expect(mockPush).toHaveBeenCalledWith('/onboarding/setup');
  });

  it('has the welcome-screen test id', () => {
    render(<WelcomePage />);

    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
  });
});
