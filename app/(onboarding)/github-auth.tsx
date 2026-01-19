/**
 * GitHub Auth Screen
 *
 * Guides user through GitHub Device Flow authentication.
 * Uses paint daube icons for brand consistency.
 */

import { GITHUB_OAUTH } from '@thumbcode/config';
import { type DeviceFlowState, GitHubAuthService, type GitHubUser } from '@thumbcode/core';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { CloseIcon, LinkIcon, SuccessIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

// Get client ID from environment variable
const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '';

// Validate environment variable in development
if (!GITHUB_CLIENT_ID && __DEV__) {
  console.warn(
    '[ThumbCode] Missing environment variable: EXPO_PUBLIC_GITHUB_CLIENT_ID is not set. ' +
      'Please add it to your .env file for GitHub authentication to work.'
  );
}


export default function GitHubAuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Auth state
  const [flowState, setFlowState] = useState<DeviceFlowState>('idle');
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string>(GITHUB_OAUTH.verificationUri);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [pollAttempt, setPollAttempt] = useState<{ current: number; max: number } | null>(null);

  // Track if polling is active
  const isPollingRef = useRef(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const isAuth = await GitHubAuthService.isAuthenticated();
      if (isAuth) {
        const user = await GitHubAuthService.getCurrentUser();
        if (user) {
          setGithubUser(user);
          setIsConnected(true);
        }
      }
    };
    checkExistingAuth();

    return () => {
      // Cancel any ongoing auth flow when unmounting
      GitHubAuthService.cancel();
    };
  }, []);

  const startDeviceFlow = useCallback(async () => {
    if (!GITHUB_CLIENT_ID) {
      Alert.alert(
        'Configuration Required',
        'GitHub Client ID is not configured. Please add EXPO_PUBLIC_GITHUB_CLIENT_ID to your environment.',
        [{ text: 'OK' }]
      );
      return;
    }

    setError(null);
    setUserCode(null);

    const result = await GitHubAuthService.startDeviceFlow({
      clientId: GITHUB_CLIENT_ID,
      scopes: GITHUB_OAUTH.scopes,
      onStateChange: setFlowState,
      onUserCode: (code, uri) => {
        setUserCode(code);
        setVerificationUri(uri);
      },
      onError: (errorMessage) => {
        setError(errorMessage);
      },
    });

    if (!result.success) {
      setError(result.error || 'Failed to start authentication');
    }
  }, []);

  const openGitHub = useCallback(async () => {
    await Linking.openURL(verificationUri);
  }, [verificationUri]);

  const startPolling = useCallback(async () => {
    if (!GITHUB_CLIENT_ID || isPollingRef.current) return;

    isPollingRef.current = true;
    setError(null);

    const result = await GitHubAuthService.pollForToken({
      clientId: GITHUB_CLIENT_ID,
      onStateChange: setFlowState,
      onPollAttempt: (current, max) => {
        setPollAttempt({ current, max });
      },
      onError: (errorMessage) => {
        setError(errorMessage);
      },
    });

    isPollingRef.current = false;
    setPollAttempt(null);

    if (result.authorized) {
      const user = await GitHubAuthService.getCurrentUser();
      setGithubUser(user);
      setIsConnected(true);
    }
  }, []);

  const handleSkip = useCallback(() => {
    GitHubAuthService.cancel();
    router.push('/(onboarding)/api-keys');
  }, [router]);

  const handleContinue = useCallback(() => {
    router.push('/(onboarding)/api-keys');
  }, [router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setUserCode(null);
    setFlowState('idle');
  }, []);

  return (
    <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
      <Container padding="lg" className="flex-1">
        {/* Progress */}
        <StepsProgress
          totalSteps={4}
          currentStep={1}
          labels={['GitHub', 'API Keys', 'Project', 'Done']}
        />

        {/* Header */}
        <VStack spacing="sm" className="mt-8 mb-8">
          <Text variant="display" size="3xl" weight="bold" className="text-white">
            Connect GitHub
          </Text>
          <Text className="text-neutral-400">
            Link your GitHub account to access repositories and enable code commits from ThumbCode.
          </Text>
        </VStack>

        {/* Error Display */}
        {error && flowState === 'error' && (
          <VStack spacing="lg" className="mb-6">
            <View
              className="bg-coral-500/20 p-4"
              style={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 14,
                borderBottomRightRadius: 18,
                borderBottomLeftRadius: 12,
              }}
            >
              <View className="flex-row items-center mb-2">
                <CloseIcon size={20} color="coral" turbulence={0.2} />
                <Text weight="semibold" className="text-coral-400 ml-2">
                  Authentication Error
                </Text>
              </View>
              <Text size="sm" className="text-coral-400/80">
                {error}
              </Text>
            </View>

            <Pressable
              onPress={handleRetry}
              className="bg-neutral-800 py-4 active:bg-neutral-700"
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 18,
              }}
            >
              <Text weight="semibold" className="text-white text-center">
                Try Again
              </Text>
            </Pressable>
          </VStack>
        )}

        {/* Auth Flow - Initial State */}
        {(flowState === 'idle' || flowState === 'requesting_code') && !isConnected && !error && (
          <VStack spacing="lg">
            <View
              className="bg-surface p-6"
              style={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 14,
                borderBottomRightRadius: 18,
                borderBottomLeftRadius: 12,
              }}
            >
              <View className="items-center mb-4">
                <LinkIcon size={40} color="teal" turbulence={0.25} />
              </View>
              <Text weight="semibold" className="text-white text-center mb-2">
                Secure Device Flow
              </Text>
              <Text size="sm" className="text-neutral-400 text-center">
                We use GitHub's Device Flow authentication - your credentials are never shared with
                us.
              </Text>
            </View>

            <Pressable
              onPress={startDeviceFlow}
              disabled={flowState === 'requesting_code'}
              className={`bg-neutral-800 py-4 ${flowState === 'requesting_code' ? 'opacity-70' : 'active:bg-neutral-700'}`}
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 18,
              }}
            >
              {flowState === 'requesting_code' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text weight="semibold" className="text-white text-center">
                  Start GitHub Authentication
                </Text>
              )}
            </Pressable>
          </VStack>
        )}

        {/* Auth Flow - Awaiting User to Enter Code */}
        {(flowState === 'awaiting_user' || flowState === 'polling') && userCode && !isConnected && (
          <VStack spacing="lg">
            <View
              className="bg-surface p-6"
              style={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 14,
                borderBottomRightRadius: 18,
                borderBottomLeftRadius: 12,
              }}
            >
              <Text size="sm" className="text-neutral-400 text-center mb-2">
                Enter this code on GitHub:
              </Text>
              <Text
                variant="display"
                size="3xl"
                weight="bold"
                className="text-coral-500 text-center tracking-wider"
              >
                {userCode}
              </Text>
              {flowState === 'polling' && pollAttempt && (
                <Text size="xs" className="text-neutral-500 text-center mt-3">
                  Checking for authorization... ({pollAttempt.current}/{pollAttempt.max})
                </Text>
              )}
            </View>

            <Pressable
              onPress={openGitHub}
              disabled={flowState === 'polling'}
              className={`bg-neutral-800 py-4 ${flowState === 'polling' ? 'opacity-70' : 'active:bg-neutral-700'}`}
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 18,
              }}
            >
              <Text weight="semibold" className="text-white text-center">
                Open GitHub →
              </Text>
            </Pressable>

            <Pressable
              onPress={startPolling}
              disabled={flowState === 'polling'}
              className={`bg-teal-600 py-4 ${flowState === 'polling' ? 'opacity-70' : 'active:bg-teal-700'}`}
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 18,
              }}
            >
              {flowState === 'polling' ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" />
                  <Text weight="semibold" className="text-white ml-2">
                    Waiting for Authorization...
                  </Text>
                </View>
              ) : (
                <Text weight="semibold" className="text-white text-center">
                  I've Entered the Code
                </Text>
              )}
            </Pressable>
          </VStack>
        )}

        {/* Success State */}
        {isConnected && (
          <VStack spacing="lg">
            <View
              className="bg-teal-600/20 p-6"
              style={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 14,
                borderBottomRightRadius: 18,
                borderBottomLeftRadius: 12,
              }}
            >
              <View className="items-center mb-4">
                <SuccessIcon size={48} color="teal" turbulence={0.25} />
              </View>
              <Text weight="semibold" className="text-teal-400 text-center text-lg">
                GitHub Connected!
              </Text>
              {githubUser && (
                <Text weight="semibold" className="text-white text-center mt-1">
                  @{githubUser.login}
                  {githubUser.name && ` (${githubUser.name})`}
                </Text>
              )}
              <Text size="sm" className="text-neutral-400 text-center mt-2">
                You can now access your repositories and push code from ThumbCode.
              </Text>
            </View>
          </VStack>
        )}
      </Container>

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

        {isConnected && (
          <Pressable
            onPress={handleContinue}
            className="flex-1 bg-coral-500 py-4 active:bg-coral-600"
            style={{
              borderTopLeftRadius: 14,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 12,
              borderBottomLeftRadius: 18,
            }}
          >
            <Text weight="semibold" className="text-white text-center">
              Continue
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
