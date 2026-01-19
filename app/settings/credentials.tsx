/**
 * Credentials Settings Screen
 *
 * Manage API keys and connected services.
 */

import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/display';
import { LinkIcon, SecurityIcon, type IconColor } from '@/components/icons';
import { Container, Divider, HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

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
          style={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 14,
            borderBottomLeftRadius: 8,
          }}
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
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 6,
          }}
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
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 12,
              borderBottomLeftRadius: 6,
            }}
          >
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#6B7280"
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
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 6,
              }}
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
                style={{
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 8,
                  borderBottomRightRadius: 12,
                  borderBottomLeftRadius: 6,
                }}
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
          style={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 6,
          }}
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

  // Mock state
  const [githubConnected, setGithubConnected] = useState(true);
  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicSet, setAnthropicSet] = useState(true);
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiSet, setOpenaiSet] = useState(false);

  const handleGitHubConnect = () => {
    // TODO: Implement GitHub OAuth flow
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
          onPress: () => setGithubConnected(false),
        },
      ]
    );
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
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
              overflow: 'hidden',
            }}
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
                subtitle={githubConnected ? 'github.com/user' : 'Connect to access repositories'}
                isConnected={githubConnected}
                lastUsed="5 minutes ago"
                onConnect={handleGitHubConnect}
                onDisconnect={handleGitHubDisconnect}
              />
            </View>
          </VStack>

          {/* API Keys */}
          <VStack
            spacing="none"
            className="bg-surface mb-6"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
              overflow: 'hidden',
            }}
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
                onSave={() => setAnthropicSet(true)}
                isSet={anthropicSet}
              />
              <Divider />
              <ApiKeyInput
                label="OpenAI (Optional)"
                placeholder="sk-..."
                value={openaiKey}
                onChange={setOpenaiKey}
                onSave={() => setOpenaiSet(true)}
                isSet={openaiSet}
              />
            </View>
          </VStack>

          {/* Security Info */}
          <View
            className="bg-teal-500/10 p-4"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 10,
            }}
          >
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
