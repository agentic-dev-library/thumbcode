/**
 * Credentials Settings Screen
 *
 * Manage API keys and connected services.
 */

import { SECURE_STORE_KEYS } from '@thumbcode/config';
import { CredentialService, GitHubAuthService } from '@thumbcode/core';
import { selectCredentialByProvider, useCredentialStore, useUserStore } from '@thumbcode/state';
import { Stack, useRouter } from 'expo-router';
import type React from 'react';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/display';
import { type IconColor, LinkIcon, SecurityIcon } from '@/components/icons';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

type CredentialIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

interface CredentialItemProps {
  Icon: CredentialIconComponent;
  iconColor?: IconColor;
  title: string;
  subtitle: string;
  isConnected: boolean;
  lastUsed?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

function CredentialItem({
  Icon,
  iconColor = 'teal',
  title,
  subtitle,
  isConnected,
  lastUsed,
  onConnect,
  onDisconnect,
}: CredentialItemProps) {
  return (
    <View className="py-4">
      <HStack align="start">
        <View
          className="w-12 h-12 bg-surface-elevated items-center justify-center mr-4"
          style={organicBorderRadius.badge}
        >
          <Icon size={24} color={iconColor} turbulence={0.2} />
        </View>

        <VStack spacing="xs" className="flex-1">
          <HStack align="center">
            <Text className="text-white font-semibold">{title}</Text>
            {isConnected && (
              <View className="ml-2">
                <Badge variant="success" size="sm">
                  Connected
                </Badge>
              </View>
            )}
          </HStack>
          <Text size="sm" className="text-neutral-500">
            {subtitle}
          </Text>
          {isConnected && lastUsed && (
            <Text size="xs" className="text-neutral-600">
              Last used: {lastUsed}
            </Text>
          )}
        </VStack>

        <Pressable
          onPress={isConnected ? onDisconnect : onConnect}
          className={`px-4 py-2 ${isConnected ? 'bg-coral-500/20' : 'bg-teal-500/20'}`}
          style={organicBorderRadius.button}
        >
          <Text className={isConnected ? 'text-coral-500' : 'text-teal-500'}>
            {isConnected ? 'Remove' : 'Connect'}
          </Text>
        </Pressable>
      </HStack>
    </View>
  );
}

interface ApiKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSet: boolean;
}

function ApiKeyInput({ label, placeholder, value, onChange, onSave, isSet }: ApiKeyInputProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Only mark as set if the key is not empty
    if (value.trim()) {
      onSave();
      setIsEditing(false);
    }
  };

  const canSave = value.trim().length > 0;

  return (
    <View className="py-4">
      <HStack justify="between" align="center" className="mb-2">
        <Text className="text-white">{label}</Text>
        {isSet && !isEditing && (
          <Badge variant="success" size="sm">
            Set
          </Badge>
        )}
      </HStack>

      {isEditing || !isSet ? (
        <VStack spacing="sm">
          <View
            className="bg-charcoal border border-neutral-700 px-4 py-3"
            style={organicBorderRadius.input}
          >
            <TextInput
              placeholder={placeholder}
              placeholderTextColor={getColor('neutral', '400')}
              value={value}
              onChangeText={onChange}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              className="text-white font-mono text-sm"
            />
          </View>
          <HStack spacing="sm">
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className={`flex-1 py-3 ${canSave ? 'bg-teal-600 active:bg-teal-700' : 'bg-neutral-700'}`}
              style={organicBorderRadius.button}
            >
              <Text
                className={`text-center font-semibold ${canSave ? 'text-white' : 'text-neutral-500'}`}
              >
                Save
              </Text>
            </Pressable>
            {isSet && (
              <Pressable
                onPress={() => setIsEditing(false)}
                className="flex-1 bg-surface py-3 active:bg-neutral-700"
                style={organicBorderRadius.button}
              >
                <Text className="text-center text-white">Cancel</Text>
              </Pressable>
            )}
          </HStack>
        </VStack>
      ) : (
        <Pressable
          onPress={() => setIsEditing(true)}
          className="bg-charcoal border border-neutral-700 px-4 py-3"
          style={organicBorderRadius.input}
        >
          <Text className="text-neutral-500">••••••••••••••••</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function CredentialsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const handleGitHubConnect = () => {
    router.push('/(onboarding)/github-auth');
  };

  const handleGitHubDisconnect = () => {
    Alert.alert(
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

  const saveApiKey = async (type: 'anthropic' | 'openai', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const validation = await CredentialService.store(type, trimmed, { skipValidation: false });
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
      isValid: validation.isValid,
      message: validation.message,
      expiresAt,
      metadata: validation.metadata,
    });

    if (!validation.isValid) {
      Alert.alert('Invalid key', validation.message || 'Validation failed');
    } else {
      Alert.alert('Saved', validation.message || 'Credential stored successfully');
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

      <ScrollView
        className="flex-1 bg-charcoal"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          {/* Connected Services */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={[organicBorderRadius.card, { overflow: 'hidden' }]}
          >
            <View className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                CONNECTED SERVICES
              </Text>
            </View>
            <View className="px-4">
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
            </View>
          </VStack>

          {/* API Keys */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={[organicBorderRadius.card, { overflow: 'hidden' }]}
          >
            <View className="px-4 py-3 border-b border-neutral-700">
              <Text size="sm" weight="semibold" className="text-neutral-400">
                API KEYS
              </Text>
            </View>
            <View className="px-4">
              <ApiKeyInput
                label="Anthropic (Claude)"
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={setAnthropicKey}
                onSave={() => saveApiKey('anthropic', anthropicKey)}
                isSet={anthropicCredential?.status === 'valid'}
              />
              <Divider />
              <ApiKeyInput
                label="OpenAI (Optional)"
                placeholder="sk-..."
                value={openaiKey}
                onChange={setOpenaiKey}
                onSave={() => saveApiKey('openai', openaiKey)}
                isSet={openaiCredential?.status === 'valid'}
              />
            </View>
          </VStack>

          {/* Security Info */}
          <View className="bg-teal-500/10 p-4" style={organicBorderRadius.card}>
            <HStack spacing="sm" align="start">
              <View className="mt-0.5">
                <SecurityIcon size={18} color="teal" turbulence={0.2} />
              </View>
              <VStack spacing="xs" className="flex-1">
                <Text className="text-teal-400 font-semibold">Secure Storage</Text>
                <Text size="sm" className="text-teal-400/80">
                  Your API keys are stored securely on your device using hardware-backed encryption.
                  They are never sent to our servers.
                </Text>
              </VStack>
            </HStack>
          </View>
        </Container>
      </ScrollView>
    </>
  );
}
