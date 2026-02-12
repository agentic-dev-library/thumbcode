/**
 * API Keys Screen
 *
 * Collects AI provider API keys (Anthropic/OpenAI).
 * Uses paint daube icons for brand consistency.
 */

import { SECURE_STORE_KEYS } from '@thumbcode/config';
import { CredentialService } from '@thumbcode/core';
import { useCredentialStore } from '@thumbcode/state';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StepsProgress } from '@/components/feedback';
import { CloseIcon, LightbulbIcon, SecurityIcon, SuccessIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Input, Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface APIKeyState {
  key: string;
  isValidating: boolean;
  isValid: boolean | null;
  error?: string;
}

export default function ApiKeysScreen() {
  const router = useRouter();
  const addCredential = useCredentialStore((s) => s.addCredential);
  const setValidationResult = useCredentialStore((s) => s.setValidationResult);

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

  const validateAnthropicKey = async (key: string) => {
    const result = await CredentialService.validateCredential('anthropic', key);
    return { isValid: result.isValid, error: result.message };
  };

  const validateOpenAIKey = async (key: string) => {
    const result = await CredentialService.validateCredential('openai', key);
    return { isValid: result.isValid, error: result.message };
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
    router.push('/(onboarding)/create-project');
  };

  const handleContinue = async () => {
    if (anthropicKey.isValid) {
      const res = await CredentialService.store('anthropic', anthropicKey.key);
      const expiresAt = res.expiresAt ? res.expiresAt.toISOString() : undefined;
      const maskedValue = `${anthropicKey.key.slice(0, 6)}…${anthropicKey.key.slice(-4)}`;
      const id = addCredential({
        provider: 'anthropic',
        name: 'Anthropic',
        secureStoreKey: SECURE_STORE_KEYS.anthropic,
        expiresAt,
        maskedValue,
        metadata: res.metadata,
      });
      setValidationResult(id, {
        isValid: res.isValid,
        message: res.message,
        expiresAt,
        metadata: res.metadata,
      });
    }
    if (openaiKey.isValid) {
      const res = await CredentialService.store('openai', openaiKey.key);
      const expiresAt = res.expiresAt ? res.expiresAt.toISOString() : undefined;
      const maskedValue = `${openaiKey.key.slice(0, 6)}…${openaiKey.key.slice(-4)}`;
      const id = addCredential({
        provider: 'openai',
        name: 'OpenAI',
        secureStoreKey: SECURE_STORE_KEYS.openai,
        expiresAt,
        maskedValue,
        metadata: res.metadata,
      });
      setValidationResult(id, {
        isValid: res.isValid,
        message: res.message,
        expiresAt,
        metadata: res.metadata,
      });
    }
    router.push('/(onboarding)/create-project');
  };

  return (
    <div className="flex-1 bg-charcoal" >
      <div
        className="flex-1"
}
        keyboardShouldPersistTaps="handled"
      >
        <Container padding="lg">
          {/* Progress */}
          <StepsProgress
            totalSteps={4}
            currentStep={2}
            labels={['GitHub', 'API Keys', 'Project', 'Done']}
          />

          {/* Header */}
          <VStack spacing="sm" className="mt-8 mb-8">
            <Text variant="display" size="3xl" weight="bold" className="text-white">
              AI Provider Keys
            </Text>
            <Text className="text-neutral-400">
              Add your API keys to power the AI agents. You need at least one provider.
            </Text>
          </VStack>

          {/* Security Notice */}
          <div className="bg-teal-600/10 p-4 mb-6" style={organicBorderRadius.card}>
            <div className="flex-row items-center mb-2">
              <div className="mr-2">
                <SecurityIcon size={20} color="teal" turbulence={0.2} />
              </div>
              <Text weight="semibold" className="text-teal-400">
                Your Keys, Your Device
              </Text>
            </div>
            <Text size="sm" className="text-neutral-400">
              Keys will be stored securely on your device. They never leave your phone and are not
              accessible to us.
            </Text>
          </div>

          {/* Anthropic Key */}
          <VStack spacing="sm" className="mb-6">
            <div className="flex-row items-center">
              <Text weight="semibold" className="text-white flex-1">
                Anthropic (Claude)
              </Text>
              {anthropicKey.isValidating && (
                <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
              )}
              {anthropicKey.isValid === true && (
                <SuccessIcon size={18} color="teal" turbulence={0.15} />
              )}
              {anthropicKey.isValid === false && (
                <CloseIcon size={18} color="coral" turbulence={0.15} />
              )}
            </div>

            <Input
              placeholder="sk-ant-api03-..."
              value={anthropicKey.key}
              onChangeText={handleAnthropicChange}
              type="password"
              error={anthropicKey.error}
            />

            <Text size="xs" className="text-neutral-500">
              Get your key at console.anthropic.com
            </Text>
          </VStack>

          {/* OpenAI Key */}
          <VStack spacing="sm" className="mb-6">
            <div className="flex-row items-center">
              <Text weight="semibold" className="text-white flex-1">
                OpenAI (GPT-4)
              </Text>
              {openaiKey.isValidating && (
                <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
              )}
              {openaiKey.isValid === true && (
                <SuccessIcon size={18} color="teal" turbulence={0.15} />
              )}
              {openaiKey.isValid === false && (
                <CloseIcon size={18} color="coral" turbulence={0.15} />
              )}
            </div>

            <Input
              placeholder="sk-proj-..."
              value={openaiKey.key}
              onChangeText={handleOpenAIChange}
              type="password"
              error={openaiKey.error}
            />

            <Text size="xs" className="text-neutral-500">
              Get your key at platform.openai.com
            </Text>
          </VStack>

          {/* Optional Badge */}
          <div className="bg-surface p-4" style={organicBorderRadius.card}>
            <div className="flex-row items-start">
              <div className="mr-2 mt-0.5">
                <LightbulbIcon size={16} color="gold" turbulence={0.2} />
              </div>
              <Text size="sm" className="text-neutral-400 flex-1">
                <Text className="text-white">Tip:</Text> You can add more providers later in
                Settings. At least one key is recommended to enable AI agents.
              </Text>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Buttons */}
      <div
        className="border-t border-neutral-800 px-6 py-4 flex-row gap-4"
        style={{ paddingBottom: 16 }}
      >
        <button type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 active:bg-neutral-700"
          style={organicBorderRadius.cta}
        >
          <Text className="text-neutral-300 text-center">Skip for Now</Text>
        </button>

        <button type="button"
          onClick={handleContinue}
          disabled={!hasAtLeastOneKey}
          className={`flex-1 py-4 ${hasAtLeastOneKey ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
          style={organicBorderRadius.cta}
        >
          <Text
            weight="semibold"
            className={hasAtLeastOneKey ? 'text-white text-center' : 'text-neutral-500 text-center'}
          >
            Continue
          </Text>
        </button>
      </div>
    </div>
  );
}
