/**
 * Credentials Settings Screen
 *
 * Manage API keys and connected services.
 */

import { SECURE_STORE_KEYS } from '@thumbcode/config';
import { CredentialService, GitHubAuthService } from '@thumbcode/core';
import { selectCredentialByProvider, useCredentialStore, useUserStore } from '@thumbcode/state';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { LinkIcon, SecurityIcon } from '@/components/icons';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { ApiKeyInput, CredentialItem } from '@/components/settings';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

export default function CredentialsScreen() {
  const router = useRouter();

  const githubCredential = useCredentialStore(selectCredentialByProvider('github'));
  const anthropicCredential = useCredentialStore(selectCredentialByProvider('anthropic'));
  const openaiCredential = useCredentialStore(selectCredentialByProvider('openai'));
  const addCredential = useCredentialStore((s) => s.addCredential);
  const setValidationResult = useCredentialStore((s) => s.setValidationResult);
  const removeCredential = useCredentialStore((s) => s.removeCredential);

  const setAuthenticated = useUserStore((s) => s.setAuthenticated);
  const setGitHubProfile = useUserStore((s) => s.setGitHubProfile);

  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [savingType, setSavingType] = useState<'anthropic' | 'openai' | null>(null);
  const [saveError, setSaveError] = useState<{ type: string; message: string } | null>(null);

  const handleGitHubConnect = () => {
    router.push('/(onboarding)/github-auth');
  };

  const handleGitHubDisconnect = () => {
    window.alert(
      'Disconnect GitHub',
      'Are you sure you want to disconnect your GitHub account? You will need to reconnect to use ThumbCode.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            GitHubAuthService.signOut().then((ok) => {
              if (ok && githubCredential) {
                removeCredential(githubCredential.id);
                setGitHubProfile(null);
                setAuthenticated(false);
              }
            });
          },
        },
      ]
    );
  };

  const validateAndStore = async (type: 'anthropic' | 'openai', trimmed: string) => {
    const validation = await CredentialService.validateCredential(type, trimmed);
    if (!validation.isValid) {
      throw new Error(validation.message || 'Invalid API key');
    }

    const storeResult = await CredentialService.store(type, trimmed, { skipValidation: true });
    if (!storeResult.isValid) {
      throw new Error(storeResult.message || 'Failed to store credential');
    }

    return validation;
  };

  const registerCredential = (
    type: 'anthropic' | 'openai',
    trimmed: string,
    validation: Awaited<ReturnType<typeof CredentialService.validateCredential>>
  ) => {
    const expiresAt = validation.expiresAt?.toISOString();
    const maskedValue = `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`;
    const credentialId = addCredential({
      provider: type,
      name: type === 'anthropic' ? 'Anthropic' : 'OpenAI',
      secureStoreKey: type === 'anthropic' ? SECURE_STORE_KEYS.anthropic : SECURE_STORE_KEYS.openai,
      expiresAt,
      maskedValue,
      metadata: validation.metadata,
    });
    setValidationResult(credentialId, {
      isValid: true,
      message: validation.message,
      expiresAt,
      metadata: validation.metadata,
    });
    return validation.message;
  };

  const saveApiKey = async (type: 'anthropic' | 'openai', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setSavingType(type);
    setSaveError(null);

    try {
      const validation = await validateAndStore(type, trimmed);
      const message = registerCredential(type, trimmed, validation);

      if (type === 'anthropic') setAnthropicKey('');
      else setOpenaiKey('');

      window.alert('Saved', message || 'Credential stored successfully');
    } catch (error) {
      setSaveError({
        type,
        message: error instanceof Error ? error.message : 'Validation failed',
      });
    } finally {
      setSavingType(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Credentials',
          headerBackTitle: 'Settings',
        }}
      />

      <div
        className="flex-1 bg-charcoal"
}
      >
        <Container padding="lg">
          {/* Connected Services */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
          >
            <div className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                CONNECTED SERVICES
              </Text>
            </div>
            <div className="px-4">
              <CredentialItem
                Icon={LinkIcon}
                iconColor="teal"
                title="GitHub"
                subtitle={
                  githubCredential?.metadata?.username
                    ? `github.com/${githubCredential.metadata.username}`
                    : githubCredential?.status === 'valid'
                      ? 'Connected'
                      : 'Connect to access repositories'
                }
                isConnected={githubCredential?.status === 'valid'}
                lastUsed={githubCredential?.lastValidatedAt}
                onConnect={handleGitHubConnect}
                onDisconnect={handleGitHubDisconnect}
              />
            </div>
          </VStack>

          {/* API Keys */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={{ ...organicBorderRadius.card,  overflow: 'hidden'  }}
          >
            <div className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                API KEYS
              </Text>
            </div>
            <div className="px-4">
              <ApiKeyInput
                label="Anthropic (Claude)"
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={(v) => {
                  setAnthropicKey(v);
                  if (saveError?.type === 'anthropic') setSaveError(null);
                }}
                onSave={() => saveApiKey('anthropic', anthropicKey)}
                isSet={anthropicCredential?.status === 'valid'}
                isSaving={savingType === 'anthropic'}
                error={saveError?.type === 'anthropic' ? saveError.message : undefined}
              />
              <Divider />
              <ApiKeyInput
                label="OpenAI (Optional)"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(v) => {
                  setOpenaiKey(v);
                  if (saveError?.type === 'openai') setSaveError(null);
                }}
                onSave={() => saveApiKey('openai', openaiKey)}
                isSet={openaiCredential?.status === 'valid'}
                isSaving={savingType === 'openai'}
                error={saveError?.type === 'openai' ? saveError.message : undefined}
              />
            </div>
          </VStack>

          {/* Security Info */}
          <div className="bg-teal-500/10 p-4" style={organicBorderRadius.card}>
            <HStack spacing="sm" align="start">
              <div className="mt-0.5">
                <SecurityIcon size={18} color="teal" turbulence={0.2} />
              </div>
              <VStack spacing="xs" className="flex-1">
                <Text className="text-teal-400 font-semibold">Secure Storage</Text>
                <Text size="sm" className="text-teal-400/80">
                  Your API keys are stored securely on your device using hardware-backed encryption.
                  They are never sent to our servers.
                </Text>
              </VStack>
            </HStack>
          </div>
        </Container>
      </div>
    </>
  );
}
