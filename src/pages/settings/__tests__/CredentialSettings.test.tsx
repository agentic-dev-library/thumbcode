/**
 * CredentialSettings Page Tests
 *
 * Verifies the credential settings page renders connected services,
 * API key inputs, and security information.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CredentialSettings } from '../CredentialSettings';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/core', () => ({
  CredentialService: {
    store: vi.fn(),
    maskSecret: vi.fn(() => 'sk-ant-***'),
  },
}));

const mockAddCredential = vi.fn(() => 'cred-1');
const mockRemoveCredential = vi.fn();
const mockSetCredentialStatus = vi.fn();

vi.mock('@/state', () => ({
  selectCredentialByProvider: (provider: string) => (state: Record<string, unknown>) =>
    state[`${provider}Credential`],
  useCredentialStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      githubCredential: null,
      anthropicCredential: null,
      openaiCredential: null,
      addCredential: mockAddCredential,
      removeCredential: mockRemoveCredential,
      setCredentialStatus: mockSetCredentialStatus,
    };
    return selector(state);
  }),
  useUserStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      setAuthenticated: vi.fn(),
      setGitHubProfile: vi.fn(),
    };
    return selector(state);
  }),
}));

describe('CredentialSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page heading', () => {
    render(<CredentialSettings />);
    expect(screen.getByText('Credentials')).toBeInTheDocument();
  });

  it('renders the connected services section with GitHub', () => {
    render(<CredentialSettings />);
    expect(screen.getByText('CONNECTED SERVICES')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('shows Connect button when GitHub is not connected', () => {
    render(<CredentialSettings />);
    expect(screen.getByTestId('connect-github')).toBeInTheDocument();
    expect(screen.getByTestId('connect-github')).toHaveTextContent('Connect');
  });

  it('renders API keys section with Anthropic and OpenAI inputs', () => {
    render(<CredentialSettings />);
    expect(screen.getByText('API KEYS')).toBeInTheDocument();
    expect(screen.getByText('Anthropic (Claude)')).toBeInTheDocument();
    expect(screen.getByText('OpenAI (Optional)')).toBeInTheDocument();
  });

  it('renders password inputs for API keys', () => {
    render(<CredentialSettings />);
    const anthropicInput = screen.getByTestId('api-key-input-anthropic-(claude)');
    const openaiInput = screen.getByTestId('api-key-input-openai-(optional)');
    expect(anthropicInput).toHaveAttribute('type', 'password');
    expect(openaiInput).toHaveAttribute('type', 'password');
  });

  it('disables save button when input is empty', () => {
    render(<CredentialSettings />);
    const saveButtons = screen.getAllByText('Save');
    for (const btn of saveButtons) {
      expect(btn).toBeDisabled();
    }
  });

  it('enables save button when API key is entered', () => {
    render(<CredentialSettings />);
    const anthropicInput = screen.getByTestId('api-key-input-anthropic-(claude)');
    fireEvent.change(anthropicInput, { target: { value: 'sk-ant-test-key' } });
    const saveBtn = screen.getByTestId('save-anthropic-(claude)');
    expect(saveBtn).not.toBeDisabled();
  });

  it('renders security info section', () => {
    render(<CredentialSettings />);
    expect(screen.getByText('Encrypted Session Storage')).toBeInTheDocument();
  });

  it('navigates back to settings when clicking back button', () => {
    render(<CredentialSettings />);
    fireEvent.click(screen.getByLabelText('Back to settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('navigates to github auth when Connect button is clicked', () => {
    render(<CredentialSettings />);
    fireEvent.click(screen.getByTestId('connect-github'));
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/github-auth');
  });
});
