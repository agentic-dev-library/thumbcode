import { render } from '@testing-library/react';

// Provide minimal document stub for react-native-web TextInput
if (typeof document === 'undefined') {
  (global as Record<string, unknown>).document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(() => ({ style: {} })),
  };
}

import ApiKeysScreen from '../api-keys';

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
    validateCredential: vi.fn(() => Promise.resolve({ isValid: false, message: 'Test' })),
    store: vi.fn(() => Promise.resolve({ isValid: true, message: 'OK' })),
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
}));

describe('ApiKeysScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ApiKeysScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays header and instructions', () => {
    const { toJSON } = render(<ApiKeysScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('AI Provider Keys');
    expect(tree).toContain('at least one provider');
  });

  it('shows security notice', () => {
    const { toJSON } = render(<ApiKeysScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Your Keys, Your Device');
  });

  it('shows both provider inputs', () => {
    const { toJSON } = render(<ApiKeysScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Anthropic (Claude)');
    expect(tree).toContain('OpenAI (GPT-4)');
  });

  it('shows Skip and Continue buttons', () => {
    const { toJSON } = render(<ApiKeysScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Skip for Now');
    expect(tree).toContain('Continue');
  });
});
