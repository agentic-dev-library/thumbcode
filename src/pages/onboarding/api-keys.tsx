/**
 * API Keys Screen
 *
 * Collects AI provider API keys (Anthropic/OpenAI).
 * Uses paint daube icons for brand consistency.
 *
 * Migrated from React Native: app/(onboarding)/api-keys.tsx
 */

import { useState } from 'react';
import { StepsProgress } from '@/components/feedback/Progress';
import {
  CloseIcon,
  LightbulbIcon,
  SecurityIcon,
  SuccessIcon,
} from '@/components/icons';
import { useAppRouter } from '@/hooks/useAppRouter';

/** Spinner component for loading states */
function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

interface APIKeyState {
  key: string;
  isValidating: boolean;
  isValid: boolean | null;
  error?: string;
}

export default function ApiKeysPage() {
  const router = useAppRouter();

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

  const validateAnthropicKey = async (key: string): Promise<{ isValid: boolean; error?: string }> => {
    // TODO: Wire up CredentialService.validateCredential when core package is web-ready
    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 800));
    const isValid = key.startsWith('sk-ant-');
    return { isValid, error: isValid ? undefined : 'Invalid Anthropic API key format' };
  };

  const validateOpenAIKey = async (key: string): Promise<{ isValid: boolean; error?: string }> => {
    // TODO: Wire up CredentialService.validateCredential when core package is web-ready
    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 800));
    const isValid = key.startsWith('sk-');
    return { isValid, error: isValid ? undefined : 'Invalid OpenAI API key format' };
  };

  const handleAnthropicChange = async (value: string) => {
    setAnthropicKey({ key: value, isValidating: false, isValid: null });

    if (value.length > 10) {
      setAnthropicKey((prev) => ({ ...prev, isValidating: true }));
      const result = await validateAnthropicKey(value);
      setAnthropicKey((prev) => ({
        ...prev,
        isValidating: false,
        isValid: result.isValid,
        error: result.error,
      }));
    }
  };

  const handleOpenAIChange = async (value: string) => {
    setOpenaiKey({ key: value, isValidating: false, isValid: null });

    if (value.length > 10) {
      setOpenaiKey((prev) => ({ ...prev, isValidating: true }));
      const result = await validateOpenAIKey(value);
      setOpenaiKey((prev) => ({
        ...prev,
        isValidating: false,
        isValid: result.isValid,
        error: result.error,
      }));
    }
  };

  const hasAtLeastOneKey = anthropicKey.isValid || openaiKey.isValid;

  const handleSkip = () => {
    router.push('/onboarding/create-project');
  };

  const handleContinue = async () => {
    // TODO: Wire up CredentialService.store and useCredentialStore when packages are web-ready
    // For now, just navigate forward
    router.push('/onboarding/create-project');
  };

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="api-keys-screen">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-32">
        {/* Progress */}
        <StepsProgress
          totalSteps={4}
          currentStep={2}
          labels={['GitHub', 'API Keys', 'Project', 'Done']}
        />

        {/* Header */}
        <div className="flex flex-col gap-2 mt-8 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            AI Provider Keys
          </h1>
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
            <span className="font-body font-semibold text-teal-400">
              Your Keys, Your Device
            </span>
          </div>
          <p className="font-body text-sm text-neutral-400">
            Keys will be stored securely on your device. They never leave your phone and are not
            accessible to us.
          </p>
        </div>

        {/* Anthropic Key */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex flex-row items-center">
            <span className="font-body font-semibold text-white flex-1">
              Anthropic (Claude)
            </span>
            {anthropicKey.isValidating && <Spinner />}
            {anthropicKey.isValid === true && (
              <SuccessIcon size={18} color="teal" turbulence={0.15} />
            )}
            {anthropicKey.isValid === false && (
              <CloseIcon size={18} color="coral" turbulence={0.15} />
            )}
          </div>

          <input
            type="password"
            placeholder="sk-ant-api03-..."
            value={anthropicKey.key}
            onChange={(e) => handleAnthropicChange(e.target.value)}
            className={`w-full bg-white border-2 ${
              anthropicKey.error ? 'border-coral-500' : 'border-neutral-200'
            } px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40`}
            data-testid="anthropic-key-input"
          />

          {anthropicKey.error && (
            <span className="font-body text-sm text-coral-500">{anthropicKey.error}</span>
          )}

          <span className="font-body text-xs text-neutral-500">
            Get your key at console.anthropic.com
          </span>
        </div>

        {/* OpenAI Key */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex flex-row items-center">
            <span className="font-body font-semibold text-white flex-1">
              OpenAI (GPT-4)
            </span>
            {openaiKey.isValidating && <Spinner />}
            {openaiKey.isValid === true && (
              <SuccessIcon size={18} color="teal" turbulence={0.15} />
            )}
            {openaiKey.isValid === false && (
              <CloseIcon size={18} color="coral" turbulence={0.15} />
            )}
          </div>

          <input
            type="password"
            placeholder="sk-proj-..."
            value={openaiKey.key}
            onChange={(e) => handleOpenAIChange(e.target.value)}
            className={`w-full bg-white border-2 ${
              openaiKey.error ? 'border-coral-500' : 'border-neutral-200'
            } px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40`}
            data-testid="openai-key-input"
          />

          {openaiKey.error && (
            <span className="font-body text-sm text-coral-500">{openaiKey.error}</span>
          )}

          <span className="font-body text-xs text-neutral-500">
            Get your key at platform.openai.com
          </span>
        </div>

        {/* Tip */}
        <div className="bg-surface p-4 rounded-organic-card">
          <div className="flex flex-row items-start">
            <span className="mr-2 mt-0.5">
              <LightbulbIcon size={16} color="gold" turbulence={0.2} />
            </span>
            <p className="font-body text-sm text-neutral-400 flex-1">
              <span className="text-white">Tip:</span> You can add more providers later in
              Settings. At least one key is recommended to enable AI agents.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-charcoal px-6 py-4 pb-8 flex flex-row gap-4">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 rounded-organic-button font-body text-neutral-300 text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
          data-testid="skip-button"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasAtLeastOneKey}
          className={`flex-1 py-4 rounded-organic-button font-body font-semibold text-center transition-colors ${
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
