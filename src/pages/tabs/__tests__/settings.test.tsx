/**
 * Settings Page Tests
 *
 * Verifies the settings page renders all sections, credential badges,
 * preferences, and navigation targets correctly.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from '../settings';

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockUpdateNotificationPreferences = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('@thumbcode/state', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => {
    const state = {
      githubProfile: { name: 'Jane Doe', login: 'janedoe' },
      settings: {
        theme: 'dark',
        notifications: { pushEnabled: true, hapticsEnabled: false },
      },
      updateNotificationPreferences: mockUpdateNotificationPreferences,
      setTheme: mockSetTheme,
    };
    return selector(state);
  },
  useCredentialStore: (selector: (state: unknown) => unknown) => {
    const state = {
      credentials: [
        { provider: 'github', status: 'valid', metadata: { username: 'janedoe' } },
        { provider: 'anthropic', status: 'valid', metadata: {} },
        { provider: 'openai', status: 'expired', metadata: {} },
      ],
    };
    return selector(state);
  },
  selectGitHubProfile: (state: { githubProfile: unknown }) => state.githubProfile,
  selectSettings: (state: { settings: unknown }) => state.settings,
  selectCredentialByProvider:
    (provider: string) =>
    (state: { credentials: { provider: string; status: string; metadata: Record<string, string> }[] }) =>
      state.credentials.find((c: { provider: string }) => c.provider === provider) ?? null,
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the settings screen test id', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('settings-screen')).toBeInTheDocument();
  });

  it('renders all settings sections', () => {
    render(<SettingsPage />);
    expect(screen.getByText('CREDENTIALS')).toBeInTheDocument();
    expect(screen.getByText('PREFERENCES')).toBeInTheDocument();
    expect(screen.getByText('AGENT SETTINGS')).toBeInTheDocument();
    expect(screen.getByText('ABOUT')).toBeInTheDocument();
  });

  it('displays user profile name and GitHub handle', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    // GitHub handle appears in both profile section and credential subtitle
    expect(screen.getAllByText('github.com/janedoe').length).toBeGreaterThanOrEqual(1);
  });

  it('displays user initials in profile avatar', () => {
    render(<SettingsPage />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('displays credential status badges', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Connected')).toBeInTheDocument(); // GitHub badge
    expect(screen.getByText('Active')).toBeInTheDocument(); // Anthropic badge
  });

  it('renders credential items: GitHub, Anthropic, OpenAI', () => {
    render(<SettingsPage />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('navigates to credentials page when clicking GitHub', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('GitHub'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings/credentials');
  });

  it('navigates to editor settings page', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Editor Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings/editor');
  });

  it('navigates to agent settings page', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Agent Behavior'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings/agents');
  });

  it('displays current theme label', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('renders version info', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('renders about section items', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Terms & Privacy')).toBeInTheDocument();
  });

  it('renders sign out button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
});
