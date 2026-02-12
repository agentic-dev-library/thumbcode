import { render } from '@testing-library/react';
import SettingsScreen from '../settings';

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useUserStore: vi.fn((selector) =>
    selector({
      githubProfile: { login: 'testuser', name: 'Test User' },
      settings: {
        theme: 'dark',
        notifications: { pushEnabled: true, hapticsEnabled: true },
      },
      updateNotificationPreferences: vi.fn(),
      setTheme: vi.fn(),
    })
  ),
  selectGitHubProfile: (s: { githubProfile: unknown }) => s.githubProfile,
  selectSettings: (s: { settings: unknown }) => s.settings,
  useCredentialStore: vi.fn((selector) =>
    selector({
      credentials: [],
    })
  ),
  selectCredentialByProvider: () => () => null,
}));

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<SettingsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays user profile info', () => {
    const { toJSON } = render(<SettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Test User');
    expect(tree).toContain('github.com/testuser');
  });

  it('renders all settings sections', () => {
    const { toJSON } = render(<SettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('CREDENTIALS');
    expect(tree).toContain('PREFERENCES');
    expect(tree).toContain('AGENT SETTINGS');
    expect(tree).toContain('ABOUT');
  });

  it('shows version and sign out', () => {
    const { toJSON } = render(<SettingsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Version');
    expect(tree).toContain('Sign Out');
  });
});
