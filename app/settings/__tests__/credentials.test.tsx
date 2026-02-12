import { render } from '@testing-library/react';

// Provide minimal document stub for react-native-web TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(() => ({ style: {} })),
  };
}

import CredentialsScreen from '../credentials';

// Mock expo-router Stack

// Mock @thumbcode/config
vi.mock('@thumbcode/config', () => ({
  SECURE_STORE_KEYS: {
    anthropic: 'thumbcode_cred_anthropic',
    openai: 'thumbcode_cred_openai',
    github: 'thumbcode_cred_github',
  },
}));

// Mock @thumbcode/core
vi.mock('@thumbcode/core', () => ({
  CredentialService: {
    store: vi.fn(() => Promise.resolve({ isValid: true, message: 'OK' })),
  },
  GitHubAuthService: {
    signOut: vi.fn(() => Promise.resolve(true)),
  },
}));

// Mock @thumbcode/state
vi.mock('@thumbcode/state', () => ({
  useCredentialStore: vi.fn((selector) =>
    selector({
      credentials: [],
      addCredential: vi.fn(() => 'cred-1'),
      setValidationResult: vi.fn(),
      removeCredential: vi.fn(),
    })
  ),
  selectCredentialByProvider: () => () => null,
  useUserStore: vi.fn((selector) =>
    selector({
      setAuthenticated: vi.fn(),
      setGitHubProfile: vi.fn(),
    })
  ),
}));

describe('CredentialsScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<CredentialsScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows connected services and API keys sections', () => {
    const { toJSON } = render(<CredentialsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('CONNECTED SERVICES');
    expect(tree).toContain('API KEYS');
  });

  it('shows GitHub connection option', () => {
    const { toJSON } = render(<CredentialsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('GitHub');
    expect(tree).toContain('Connect');
  });

  it('shows security info', () => {
    const { toJSON } = render(<CredentialsScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Secure Storage');
    expect(tree).toContain('hardware-backed encryption');
  });
});
