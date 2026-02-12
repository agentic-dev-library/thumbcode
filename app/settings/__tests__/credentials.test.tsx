import { render } from '@testing-library/react-native';

// Provide minimal document stub for react-native-web TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    createElement: jest.fn(() => ({ style: {} })),
  };
}

import CredentialsScreen from '../credentials';

// Mock expo-router Stack
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock @thumbcode/config
jest.mock('@thumbcode/config', () => ({
  SECURE_STORE_KEYS: {
    anthropic: 'thumbcode_cred_anthropic',
    openai: 'thumbcode_cred_openai',
    github: 'thumbcode_cred_github',
  },
}));

// Mock @thumbcode/core
jest.mock('@thumbcode/core', () => ({
  CredentialService: {
    store: jest.fn(() => Promise.resolve({ isValid: true, message: 'OK' })),
  },
  GitHubAuthService: {
    signOut: jest.fn(() => Promise.resolve(true)),
  },
}));

// Mock @thumbcode/state
jest.mock('@thumbcode/state', () => ({
  useCredentialStore: jest.fn((selector) =>
    selector({
      credentials: [],
      addCredential: jest.fn(() => 'cred-1'),
      setValidationResult: jest.fn(),
      removeCredential: jest.fn(),
    })
  ),
  selectCredentialByProvider: () => () => null,
  useUserStore: jest.fn((selector) =>
    selector({
      setAuthenticated: jest.fn(),
      setGitHubProfile: jest.fn(),
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
