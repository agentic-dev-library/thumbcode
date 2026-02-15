import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CredentialService } from '@thumbcode/core';
import { useCredentialStore } from '@thumbcode/state';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApiKeysPage from '../api-keys';

// Mock CredentialService
vi.mock('@thumbcode/core', async () => {
  return {
    CredentialService: {
      validateCredential: vi.fn(),
      store: vi.fn(),
      maskSecret: vi.fn(),
    },
  };
});

// Mock useCredentialStore
const mockAddCredential = vi.fn();
vi.mock('@thumbcode/state', () => ({
  useCredentialStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector({
        addCredential: mockAddCredential,
      });
    }
    return {
      addCredential: mockAddCredential,
    };
  }),
}));

// Mock useAppRouter
const mockPush = vi.fn();
vi.mock('@/hooks/useAppRouter', () => ({
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

    await waitFor(() => {
      expect(CredentialService.validateCredential).toHaveBeenCalledWith(
        'anthropic',
        'sk-ant-valid-key-123'
      );
    });
  });

  it('validates OpenAI key using CredentialService', async () => {
    vi.mocked(CredentialService.validateCredential).mockResolvedValue({
      isValid: true,
    });

    render(<ApiKeysPage />);

    const input = screen.getByTestId('openai-key-input');
    fireEvent.change(input, { target: { value: 'sk-proj-valid-key-123' } });

    await waitFor(() => {
      expect(CredentialService.validateCredential).toHaveBeenCalledWith(
        'openai',
        'sk-proj-valid-key-123'
      );
    });
  });

  it('stores valid keys on continue', async () => {
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

    // Wait for validation to complete (simulated by waitFor)
    await waitFor(() =>
      expect(CredentialService.validateCredential).toHaveBeenCalledTimes(2)
    );

    // Click continue
    const continueBtn = screen.getByTestId('continue-button');
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(CredentialService.store).toHaveBeenCalledWith(
        'anthropic',
        'sk-ant-valid-key-123'
      );
      expect(CredentialService.store).toHaveBeenCalledWith(
        'openai',
        'sk-proj-valid-key-123'
      );

      expect(mockAddCredential).toHaveBeenCalledTimes(2);
      expect(mockAddCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'anthropic',
        })
      );
      expect(mockAddCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'openai',
        })
      );

      expect(mockPush).toHaveBeenCalledWith('/onboarding/create-project');
    });
  });
});
