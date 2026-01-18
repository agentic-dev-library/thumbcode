/**
 * API Keys Screen
 *
 * Collects AI provider API keys (Anthropic/OpenAI).
 */

import { CredentialService } from '@thumbcode/core/src/credentials/CredentialService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { Container, VStack } from '@/components/layout';
import { Input, Text } from '@/components/ui';

interface APIKeyState {
  key: string;
  isValidating: boolean;
  isValid: boolean | null;
  error?: string;
}

export default function ApiKeysScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      await CredentialService.store('anthropic', anthropicKey.key);
    }
    if (openaiKey.isValid) {
      await CredentialService.store('openai', openaiKey.key);
    }
    router.push('/(onboarding)/create-project');
  };

  return (
    <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
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
          <View
            className="bg-teal-600/10 p-4 mb-6"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-lg mr-2">🔐</Text>
              <Text weight="semibold" className="text-teal-400">
                Your Keys, Your Device
              </Text>
            </View>
            <Text size="sm" className="text-neutral-400">
              Keys will be stored securely on your device. They never leave your phone and are not
              accessible to us.
            </Text>
          </View>

          {/* Anthropic Key */}
          <VStack spacing="sm" className="mb-6">
            <View className="flex-row items-center">
              <Text weight="semibold" className="text-white flex-1">
                Anthropic (Claude)
              </Text>
              {anthropicKey.isValidating && <ActivityIndicator size="small" color="#14B8A6" />}
              {anthropicKey.isValid === true && <Text className="text-teal-400">✓</Text>}
              {anthropicKey.isValid === false && <Text className="text-coral-400">✕</Text>}
            </View>

            <Input
              placeholder="sk-ant-api03-..."
              value={anthropicKey.key}
              onChangeText={handleAnthropicChange}
              secureTextEntry
              error={anthropicKey.error}
            />

            <Text size="xs" className="text-neutral-500">
              Get your key at console.anthropic.com
            </Text>
          </VStack>

          {/* OpenAI Key */}
          <VStack spacing="sm" className="mb-6">
            <View className="flex-row items-center">
              <Text weight="semibold" className="text-white flex-1">
                OpenAI (GPT-4)
              </Text>
              {openaiKey.isValidating && <ActivityIndicator size="small" color="#14B8A6" />}
              {openaiKey.isValid === true && <Text className="text-teal-400">✓</Text>}
              {openaiKey.isValid === false && <Text className="text-coral-400">✕</Text>}
            </View>

            <Input
              placeholder="sk-proj-..."
              value={openaiKey.key}
              onChangeText={handleOpenAIChange}
              secureTextEntry
              error={openaiKey.error}
            />

            <Text size="xs" className="text-neutral-500">
              Get your key at platform.openai.com
            </Text>
          </VStack>

          {/* Optional Badge */}
          <View
            className="bg-surface p-4"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
            <Text size="sm" className="text-neutral-400">
              💡 <Text className="text-white">Tip:</Text> You can add more providers later in
              Settings. At least one key is recommended to enable AI agents.
            </Text>
          </View>
        </Container>
      </ScrollView>

      {/* Bottom Buttons */}
      <View
        className="border-t border-neutral-800 px-6 py-4 flex-row gap-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleSkip}
          className="flex-1 bg-neutral-800 py-4 active:bg-neutral-700"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 18,
          }}
        >
          <Text className="text-neutral-300 text-center">Skip for Now</Text>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          disabled={!hasAtLeastOneKey}
          className={`flex-1 py-4 ${hasAtLeastOneKey ? 'bg-coral-500 active:bg-coral-600' : 'bg-neutral-700'}`}
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 18,
          }}
        >
          <Text
            weight="semibold"
            className={hasAtLeastOneKey ? 'text-white text-center' : 'text-neutral-500 text-center'}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
