import { render } from '@testing-library/react-native';
import GitHubAuthScreen from '../github-auth';

// Mock @thumbcode/config/env
jest.mock('@thumbcode/config/env', () => ({
  env: {
    githubClientId: 'test-client-id',
  },
}));

// Mock @thumbcode/core
jest.mock('@thumbcode/core', () => ({
  CredentialService: {
    retrieve: jest.fn(() => Promise.resolve({ secret: null })),
    validateCredential: jest.fn(() =>
      Promise.resolve({ isValid: false, message: 'Test' })
    ),
  },
  GitHubAuthService: {
    startDeviceFlow: jest.fn(() => Promise.resolve({ success: false })),
    pollForToken: jest.fn(() => Promise.resolve({ authorized: false })),
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
  },
}));

// Mock @thumbcode/state
jest.mock('@thumbcode/state', () => ({
  useCredentialStore: jest.fn((selector) =>
    selector({
      addCredential: jest.fn(() => 'cred-1'),
      setValidationResult: jest.fn(),
    })
  ),
  useUserStore: jest.fn((selector) =>
    selector({
      setAuthenticated: jest.fn(),
      setGitHubProfile: jest.fn(),
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
