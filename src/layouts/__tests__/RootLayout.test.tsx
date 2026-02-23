/**
 * RootLayout Tests
 *
 * Verifies the root layout handles onboarding redirect logic,
 * loading state, and renders the Outlet for child routes.
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RootLayout } from '../RootLayout';

const mockReplace = vi.fn();
vi.mock('@/hooks/useAppRouter', () => ({
  useAppRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
  }),
}));

let mockIsLoading = false;
let mockHasCompletedOnboarding = true;

vi.mock('@/contexts/onboarding', () => ({
  useOnboarding: () => ({
    isLoading: mockIsLoading,
    hasCompletedOnboarding: mockHasCompletedOnboarding,
  }),
}));

let mockPathname = '/';
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockHasCompletedOnboarding = true;
    mockPathname = '/';
  });

  it('renders loading spinner when isLoading is true', () => {
    mockIsLoading = true;
    render(<RootLayout />);
    // The spinner has animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render Outlet when loading', () => {
    mockIsLoading = true;
    render(<RootLayout />);
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('renders Outlet when not loading', () => {
    mockIsLoading = false;
    render(<RootLayout />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });

  it('redirects to onboarding when not completed and not in onboarding', () => {
    mockHasCompletedOnboarding = false;
    mockPathname = '/';
    render(<RootLayout />);
    expect(mockReplace).toHaveBeenCalledWith('/onboarding/welcome');
  });

  it('redirects to "/" when onboarding completed and still on onboarding route', () => {
    mockHasCompletedOnboarding = true;
    mockPathname = '/onboarding/complete';
    render(<RootLayout />);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does not redirect when onboarding completed and on main route', () => {
    mockHasCompletedOnboarding = true;
    mockPathname = '/';
    render(<RootLayout />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when not completed but on onboarding route', () => {
    mockHasCompletedOnboarding = false;
    mockPathname = '/onboarding/welcome';
    render(<RootLayout />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect while still loading', () => {
    mockIsLoading = true;
    mockHasCompletedOnboarding = false;
    mockPathname = '/';
    render(<RootLayout />);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
