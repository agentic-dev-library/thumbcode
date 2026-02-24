/**
 * API Keys Screen
 *
 * Collects AI provider API keys (Anthropic/OpenAI).
 * Uses paint daube icons for brand consistency.
 *
 * Migrated from React Native: app/(onboarding)/api-keys.tsx
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { StepsProgress } from '@/components/feedback/Progress';
import { LightbulbIcon, SecurityIcon } from '@/components/icons';
import { CredentialService } from '@/core';
import { useAppRouter } from '@/hooks/use-app-router';
import { logger } from '@/lib/logger';
import { type CredentialProvider, useCredentialStore } from '@/state';
import { APIKeyInput } from './components/APIKeyInput';

interface APIKeyState {
  key: string;
  isValidating: boolean;
  isValid: boolean | null;
  error?: string;
}

export default function ApiKeysPage() {
  const router = useAppRouter();
  const addCredential = useCredentialStore((state) => state.addCredential);
  const setValidationResult = useCredentialStore((state) => state.setValidationResult);

  const [anthropicKey, setAnthropicKey] = useState<APIKeyState>({
    key: '',
    isValidating: false,
    isValid: null,
  });

  const [openaiKey, setOpenaiKey] = useState<APIKeyState>({
    key: '',
    isValidating: false,
    isValid: null,
  });

  const [globalError, setGlobalError] = useState<string | null>(null);

  // Debounce refs
  const anthropicTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const openaiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Abort controller refs to cancel in-flight requests
  const anthropicAbortRef = useRef<AbortController | null>(null);
  const openaiAbortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (anthropicTimeoutRef.current) clearTimeout(anthropicTimeoutRef.current);
      if (openaiTimeoutRef.current) clearTimeout(openaiTimeoutRef.current);
      if (anthropicAbortRef.current) anthropicAbortRef.current.abort();
      if (openaiAbortRef.current) openaiAbortRef.current.abort();
    };
  }, []);

  const validateKey = useCallback(
    async (
      provider: 'anthropic' | 'openai',
      key: string,
      setKey: React.Dispatch<React.SetStateAction<APIKeyState>>,
      abortRef: React.MutableRefObject<AbortController | null>
    ) => {
      // Cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortRef.current = abortController;

      setKey((prev) => ({ ...prev, isValidating: true, error: undefined }));

      try {
        // Simulate network request cancellation check (since CredentialService might not support signal yet)
        if (abortController.signal.aborted) return;

        const result = await CredentialService.validateCredential(provider, key);

        if (abortController.signal.aborted) return;

        setKey((prev) => ({
          ...prev,
          isValidating: false,
          isValid: result.isValid,
          error: result.message,
        }));
      } catch (error) {
        if (abortController.signal.aborted) return;

        logger.error(`Error validating ${provider} key`, error);
        setKey((prev) => ({
          ...prev,
          isValidating: false,
          isValid: false,
          error: 'Validation failed due to network or service error',
        }));
      } finally {
        if (abortRef.current === abortController) {
          abortRef.current = null;
        }
      }
    },
    []
  );

  const handleKeyChange = (
    value: string,
    setKey: React.Dispatch<React.SetStateAction<APIKeyState>>,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    provider: 'anthropic' | 'openai',
    abortRef: React.MutableRefObject<AbortController | null>
  ) => {
    setKey((prev) => ({ ...prev, key: value, isValid: null, error: undefined }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length > 10) {
      timeoutRef.current = setTimeout(() => {
        validateKey(provider, value, setKey, abortRef);
      }, 500); // 500ms debounce
    }
  };

  const hasAtLeastOneKey =
    (anthropicKey.isValid || openaiKey.isValid) &&
    !anthropicKey.isValidating &&
    !openaiKey.isValidating;

  const handleSkip = () => {
    router.push('/onboarding/create-project');
  };

  const storeCredential = async (
    provider: CredentialProvider,
    keyState: APIKeyState,
    name: string,
    secureStoreKey: string
  ) => {
    if (keyState.isValid && keyState.key) {
      try {
        // Cast provider to the store/mask API type ('anthropic' | 'openai')
        const apiProvider = provider as 'anthropic' | 'openai';
        await CredentialService.store(apiProvider, keyState.key);

        const credId = addCredential({
          provider,
          name,
          secureStoreKey,
          maskedValue: CredentialService.maskSecret(keyState.key, apiProvider),
        });

        // Explicitly set validation result as valid since we just stored it
        setValidationResult(credId, {
          isValid: true,
          expiresAt: undefined,
        });
      } catch (error) {
        logger.error(`Failed to store ${provider} credential`, error);
        throw new Error(`Failed to save ${name} key`);
      }
    }
  };

  const handleContinue = async () => {
    setGlobalError(null);

    try {
      await Promise.all([
        storeCredential('anthropic', anthropicKey, 'Anthropic', 'anthropic'),
        storeCredential('openai', openaiKey, 'OpenAI', 'openai'),
      ]);

      router.push('/onboarding/create-project');
    } catch {
      setGlobalError('Failed to save credentials. Please try again.');
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-charcoal animate-page-enter"
      data-testid="api-keys-screen"
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-32 hide-scrollbar">
        {/* Progress */}
        <StepsProgress
          totalSteps={4}
          currentStep={2}
          labels={['GitHub', 'API Keys', 'Project', 'Done']}
        />

        {/* Header */}
        <div className="flex flex-col gap-2 mt-8 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">AI Provider Keys</h1>
          <p className="font-body text-neutral-400">
            Add your API keys to power the AI agents. You need at least one provider.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-teal-600/10 p-4 mb-6 rounded-organic-card">
          <div className="flex flex-row items-center mb-2">
            <span className="mr-2">
              <SecurityIcon size={20} color="teal" turbulence={0.2} />
            </span>
            <span className="font-body font-semibold text-teal-400">Your Keys, Your Device</span>
          </div>
          <p className="font-body text-sm text-neutral-400">
            Keys will be stored securely on your device. They never leave your phone and are not
            accessible to us.
          </p>
        </div>

        {globalError && (
          <div className="bg-coral-500/10 border border-coral-500/20 p-4 mb-6 rounded-organic-card">
            <p className="font-body text-sm text-coral-500">{globalError}</p>
          </div>
        )}

        {/* Anthropic Key */}
        <APIKeyInput
          label="Anthropic (Claude)"
          placeholder="sk-ant-api03-..."
          value={anthropicKey.key}
          onChange={(val) =>
            handleKeyChange(
              val,
              setAnthropicKey,
              anthropicTimeoutRef,
              'anthropic',
              anthropicAbortRef
            )
          }
          isValidating={anthropicKey.isValidating}
          isValid={anthropicKey.isValid}
          error={anthropicKey.error}
          helperText="Get your key at console.anthropic.com"
          testId="anthropic-key-input"
        />

        {/* OpenAI Key */}
        <APIKeyInput
          label="OpenAI (GPT-4)"
          placeholder="sk-proj-..."
          value={openaiKey.key}
          onChange={(val) =>
            handleKeyChange(val, setOpenaiKey, openaiTimeoutRef, 'openai', openaiAbortRef)
          }
          isValidating={openaiKey.isValidating}
          isValid={openaiKey.isValid}
          error={openaiKey.error}
          helperText="Get your key at platform.openai.com"
          testId="openai-key-input"
        />

        {/* Tip */}
        <div className="bg-surface p-4 rounded-organic-card shadow-organic-card">
          <div className="flex flex-row items-start">
            <span className="mr-2 mt-0.5">
              <LightbulbIcon size={16} color="gold" turbulence={0.2} />
            </span>
            <p className="font-body text-sm text-neutral-400 flex-1">
              <span className="text-white">Tip:</span> You can add more providers later in Settings.
              At least one key is recommended to enable AI agents.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-white/5 glass px-6 py-4 flex flex-row gap-4"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 rounded-organic-button font-body text-neutral-300 text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors tap-feedback"
          data-testid="skip-button"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasAtLeastOneKey}
          className={`flex-1 py-4 rounded-organic-button font-body font-semibold text-center transition-colors tap-feedback ${
            hasAtLeastOneKey
              ? 'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700'
              : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
          }`}
          data-testid="continue-button"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
