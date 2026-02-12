import { render } from '@testing-library/react';
import GitHubAuthScreen from '../github-auth';

// Mock @thumbcode/config/env
vi.mock('@thumbcode/config/env', () => ({
  env: {
    githubClientId: 'test-client-id',
  },
}));

// Mock @thumbcode/core
vi.mock('@thumbcode/core', () => ({
  CredentialService: {
    retrieve: vi.fn(() => Promise.resolve({ secret: null })),
    validateCredential: vi.fn(() => Promise.resolve({ isValid: false, message: 'Test' })),
  },
  GitHubAuthService: {
    startDeviceFlow: vi.fn(() => Promise.resolve({ success: false })),
    pollForToken: vi.fn(() => Promise.resolve({ authorized: false })),
    getCurrentUser: vi.fn(() => Promise.resolve(null)),
  },
}));

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useCredentialStore: vi.fn((selector) =>
    selector({
      addCredential: vi.fn(() => 'cred-1'),
      setValidationResult: vi.fn(),
    })
  ),
  useUserStore: vi.fn((selector) =>
    selector({
      setAuthenticated: vi.fn(),
      setGitHubProfile: vi.fn(),
    })
  ),
}));

describe('GitHubAuthScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<GitHubAuthScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays header and description', () => {
    const { toJSON } = render(<GitHubAuthScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Connect GitHub');
    expect(tree).toContain('Link your GitHub account');
  });

  it('shows device flow info', () => {
    const { toJSON } = render(<GitHubAuthScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Secure Device Flow');
    expect(tree).toContain('Start GitHub Authentication');
  });

  it('shows Skip button', () => {
    const { toJSON } = render(<GitHubAuthScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Skip for Now');
  });
});
