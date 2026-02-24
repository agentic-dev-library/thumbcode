import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CredentialService } from '@/core';
import ApiKeysPage from '../api-keys';

// Mock CredentialService
vi.mock('@/core', async () => {
  return {
    CredentialService: {
      validateCredential: vi.fn(),
      store: vi.fn(),
      maskSecret: vi.fn(),
    },
  };
});

// Mock useCredentialStore
const mockAddCredential = vi.fn(() => 'test-cred-id');
const mockSetValidationResult = vi.fn();

vi.mock('@/state', () => ({
  useCredentialStore: vi.fn((selector) => {
    const state = {
      addCredential: mockAddCredential,
      setValidationResult: mockSetValidationResult,
    };

    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  }),
}));

// Mock useAppRouter
const mockPush = vi.fn();
vi.mock('@/hooks/use-app-router', () => ({
  useAppRouter: () => ({
    push: mockPush,
  }),
}));

describe('ApiKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CredentialService.maskSecret).mockImplementation(
      (secret: string) => `${secret.slice(0, 5)}...`
    );
  });

  it('validates Anthropic key using CredentialService', async () => {
    vi.mocked(CredentialService.validateCredential).mockResolvedValue({
      isValid: true,
    });

    render(<ApiKeysPage />);

    const input = screen.getByTestId('anthropic-key-input');
    fireEvent.change(input, { target: { value: 'sk-ant-valid-key-123' } });

    // Wait for debounce and validation
    await waitFor(
      () => {
        expect(CredentialService.validateCredential).toHaveBeenCalledWith(
          'anthropic',
          'sk-ant-valid-key-123'
        );
      },
      { timeout: 1000 }
    );
  });

  it('validates OpenAI key using CredentialService', async () => {
    vi.mocked(CredentialService.validateCredential).mockResolvedValue({
      isValid: true,
    });

    render(<ApiKeysPage />);

    const input = screen.getByTestId('openai-key-input');
    fireEvent.change(input, { target: { value: 'sk-proj-valid-key-123' } });

    await waitFor(
      () => {
        expect(CredentialService.validateCredential).toHaveBeenCalledWith(
          'openai',
          'sk-proj-valid-key-123'
        );
      },
      { timeout: 1000 }
    );
  });

  it('navigates to create project when skipping', () => {
    render(<ApiKeysPage />);
    const skipBtn = screen.getByTestId('skip-button');
    fireEvent.click(skipBtn);
    expect(mockPush).toHaveBeenCalledWith('/onboarding/create-project');
  });

  it('disables continue button initially', () => {
    render(<ApiKeysPage />);
    const continueBtn = screen.getByTestId('continue-button');
    expect(continueBtn).toBeDisabled();
  });

  it('shows error state for invalid keys', async () => {
    vi.mocked(CredentialService.validateCredential).mockResolvedValue({
      isValid: false,
      message: 'Invalid API key format',
    });

    render(<ApiKeysPage />);

    const input = screen.getByTestId('anthropic-key-input');
    fireEvent.change(input, { target: { value: 'invalid-key' } });

    await waitFor(
      () => {
        expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('stores valid keys and sets validation status on continue', async () => {
    // Setup valid keys
    vi.mocked(CredentialService.validateCredential).mockImplementation(
      (type: string, key: string) => {
        if (type === 'anthropic' && key.startsWith('sk-ant'))
          return Promise.resolve({ isValid: true });
        if (type === 'openai' && key.startsWith('sk-proj'))
          return Promise.resolve({ isValid: true });
        return Promise.resolve({ isValid: false, message: 'Invalid key' });
      }
    );

    vi.mocked(CredentialService.store).mockResolvedValue({ isValid: true });

    render(<ApiKeysPage />);

    // Enter valid keys
    const antInput = screen.getByTestId('anthropic-key-input');
    fireEvent.change(antInput, { target: { value: 'sk-ant-valid-key-123' } });

    const openAiInput = screen.getByTestId('openai-key-input');
    fireEvent.change(openAiInput, { target: { value: 'sk-proj-valid-key-123' } });

    // Wait for validation to complete
    await waitFor(() => expect(CredentialService.validateCredential).toHaveBeenCalledTimes(2), {
      timeout: 1500,
    });

    // Click continue
    const continueBtn = screen.getByTestId('continue-button');
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    await waitFor(() => {
      // Check storage
      expect(CredentialService.store).toHaveBeenCalledWith('anthropic', 'sk-ant-valid-key-123');
      expect(CredentialService.store).toHaveBeenCalledWith('openai', 'sk-proj-valid-key-123');

      // Check state updates
      expect(mockAddCredential).toHaveBeenCalledTimes(2);

      // Verify setValidationResult was called with the mock ID returned by addCredential
      expect(mockSetValidationResult).toHaveBeenCalledWith(
        'test-cred-id',
        expect.objectContaining({ isValid: true })
      );

      expect(mockPush).toHaveBeenCalledWith('/onboarding/create-project');
    });
  });
});
