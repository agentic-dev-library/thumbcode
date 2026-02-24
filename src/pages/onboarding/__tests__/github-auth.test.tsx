import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GitHubAuthService } from '@/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GitHubAuthPage from '../github-auth';

// Mock @thumbcode/core
vi.mock('@/core', () => ({
  GitHubAuthService: {
    startDeviceFlow: vi.fn(),
    pollForToken: vi.fn(),
    cancel: vi.fn(),
  },
}));

// Mock @thumbcode/config
vi.mock('@/config', () => ({
  env: { githubClientId: 'test-client-id' },
  GITHUB_OAUTH: { scopes: 'repo,user' },
}));

// Mock useAppRouter
const mockPush = vi.fn();
vi.mock('@/hooks/use-app-router', () => ({
  useAppRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('GitHubAuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state with start button', () => {
    render(<GitHubAuthPage />);

    expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
    expect(screen.getByTestId('start-auth-button')).toBeInTheDocument();
    expect(screen.getByText('Start GitHub Authentication')).toBeInTheDocument();
  });

  it('shows device code after starting flow', async () => {
    vi.mocked(GitHubAuthService.startDeviceFlow).mockResolvedValue({
      success: true,
      data: {
        device_code: 'test-device-code',
        user_code: 'TEST-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 5,
      },
    });

    render(<GitHubAuthPage />);

    fireEvent.click(screen.getByTestId('start-auth-button'));

    await waitFor(() => {
      expect(screen.getByText('TEST-1234')).toBeInTheDocument();
    });

    expect(screen.getByTestId('open-github-button')).toBeInTheDocument();
    expect(screen.getByTestId('check-auth-button')).toBeInTheDocument();
  });

  it('shows error when device flow fails', async () => {
    vi.mocked(GitHubAuthService.startDeviceFlow).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    render(<GitHubAuthPage />);

    fireEvent.click(screen.getByTestId('start-auth-button'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows success state after authorization', async () => {
    vi.mocked(GitHubAuthService.startDeviceFlow).mockResolvedValue({
      success: true,
      data: {
        device_code: 'test-device-code',
        user_code: 'AUTH-5678',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 5,
      },
    });

    vi.mocked(GitHubAuthService.pollForToken).mockResolvedValue({
      authorized: true,
      shouldContinue: false,
      accessToken: 'gho_test_token',
    });

    render(<GitHubAuthPage />);

    // Start flow
    fireEvent.click(screen.getByTestId('start-auth-button'));

    await waitFor(() => {
      expect(screen.getByText('AUTH-5678')).toBeInTheDocument();
    });

    // Check auth
    fireEvent.click(screen.getByTestId('check-auth-button'));

    await waitFor(() => {
      expect(screen.getByText('GitHub Connected!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('continue-button')).toBeInTheDocument();
  });

  it('navigates to api-keys on skip', () => {
    render(<GitHubAuthPage />);

    fireEvent.click(screen.getByTestId('skip-button'));

    expect(mockPush).toHaveBeenCalledWith('/onboarding/api-keys');
  });

  it('cancels auth service on unmount', () => {
    const { unmount } = render(<GitHubAuthPage />);

    unmount();

    expect(GitHubAuthService.cancel).toHaveBeenCalled();
  });
});
