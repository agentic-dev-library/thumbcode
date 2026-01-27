/**
 * GitHub Auth Screen
 *
 * Guides user through GitHub Device Flow authentication.
 * Uses paint daube icons for brand consistency.
 */

import { env } from '@thumbcode/config/env';
import { CredentialService, GitHubAuthService } from '@thumbcode/core';
import { useCredentialStore, useUserStore } from '@thumbcode/state';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { LinkIcon, SuccessIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

export default function GitHubAuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addCredential = useCredentialStore((s) => s.addCredential);
  const setValidationResult = useCredentialStore((s) => s.setValidationResult);
  const setAuthenticated = useUserStore((s) => s.setAuthenticated);
  const setGitHubProfile = useUserStore((s) => s.setGitHubProfile);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string>('https://github.com/login/device');
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<{ attempt: number; max: number } | null>(null);

  const startDeviceFlow = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setPollStatus(null);

    const result = await GitHubAuthService.startDeviceFlow({
      clientId: env.githubClientId,
      onUserCode: (code, uri) => {
        setUserCode(code);
        setVerificationUri(uri);
      },
      onError: (msg) => setErrorMessage(msg),
    });

    if (!result.success) {
      setIsAuthenticating(false);
      return;
    }

    // Automatically start polling for token
    checkAuth();
  };

  const openGitHub = async () => {
    await Linking.openURL(verificationUri);
  };

  const checkAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);

    const result = await GitHubAuthService.pollForToken({
      clientId: env.githubClientId,
      onPollAttempt: (attempt, max) => setPollStatus({ attempt, max }),
      onError: (msg) => setErrorMessage(msg),
    });

    if (!result.authorized) {
      setIsAuthenticating(false);
      return;
    }

    // Update metadata stores after successful auth
    const { secret } = await CredentialService.retrieve('github');
    if (secret) {
      const validation = await CredentialService.validateCredential('github', secret);
      type GitHubValidationMeta = {
        username?: string;
        scopes?: string[];
        avatarUrl?: string;
        name?: string;
        rateLimit?: number;
        remainingCalls?: number;
      };
      const meta = validation.metadata as unknown as GitHubValidationMeta | undefined;
      const maskedValue = `${secret.slice(0, 4)}…${secret.slice(-4)}`;
      const credentialId = addCredential({
        provider: 'github',
        name: 'GitHub',
        secureStoreKey: 'thumbcode_cred_github',
        expiresAt: validation.expiresAt?.toISOString(),
        maskedValue,
        metadata: meta
          ? {
              username: meta.username,
              scopes: meta.scopes,
              rateLimit: meta.rateLimit,
              remainingCalls: meta.remainingCalls,
            }
          : undefined,
      });
      setValidationResult(credentialId, {
        isValid: validation.isValid,
        message: validation.message,
        expiresAt: validation.expiresAt?.toISOString(),
        metadata: validation.metadata,
      });
    }

    const user = await GitHubAuthService.getCurrentUser();
    if (user) {
      setGitHubProfile({
        login: user.login,
        id: user.id,
        avatarUrl: user.avatar_url,
        name: user.name ?? undefined,
        publicRepos: 0,
        followers: 0,
        following: 0,
      });
    }

    setAuthenticated(true);
    setIsConnected(true);
    setIsAuthenticating(false);
  };

  const handleSkip = () => {
    router.push('/(onboarding)/api-keys');
  };

  const handleContinue = () => {
    router.push('/(onboarding)/api-keys');
  };

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

        {/* Auth Flow */}
        {!userCode && !isConnected && (
          <VStack spacing="lg">
            <View className="bg-surface p-6" style={organicBorderRadius.card}>
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
              disabled={isAuthenticating}
              className={`bg-neutral-800 py-4 ${isAuthenticating ? 'opacity-70' : 'active:bg-neutral-700'}`}
              style={organicBorderRadius.cta}
            >
              {isAuthenticating ? (
                <ActivityIndicator color={getColor('neutral', '50')} />
              ) : (
                <Text weight="semibold" className="text-white text-center">
                  Start GitHub Authentication
                </Text>
              )}
            </Pressable>

            {errorMessage && (
              <Text size="sm" className="text-coral-400 text-center">
                {errorMessage}
              </Text>
            )}
          </VStack>
        )}

        {userCode && !isConnected && (
          <VStack spacing="lg">
            <View className="bg-surface p-6" style={organicBorderRadius.card}>
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
            </View>

            <Pressable
              onPress={openGitHub}
              className="bg-neutral-800 py-4 active:bg-neutral-700"
              style={organicBorderRadius.cta}
            >
              <Text weight="semibold" className="text-white text-center">
                Open GitHub →
              </Text>
            </Pressable>

            <Pressable
              onPress={checkAuth}
              disabled={isAuthenticating}
              className={`bg-teal-600 py-4 ${isAuthenticating ? 'opacity-70' : 'active:bg-teal-700'}`}
              style={organicBorderRadius.cta}
            >
              {isAuthenticating ? (
                <ActivityIndicator color={getColor('neutral', '50')} />
              ) : (
                <Text weight="semibold" className="text-white text-center">
                  I've Entered the Code
                </Text>
              )}
            </Pressable>

            {pollStatus && (
              <Text size="sm" className="text-neutral-500 text-center">
                Checking authorization… {pollStatus.attempt}/{pollStatus.max}
              </Text>
            )}
            {errorMessage && (
              <Text size="sm" className="text-coral-400 text-center">
                {errorMessage}
              </Text>
            )}
          </VStack>
        )}

        {isConnected && (
          <VStack spacing="lg">
            <View className="bg-teal-600/20 p-6" style={organicBorderRadius.card}>
              <View className="items-center mb-4">
                <SuccessIcon size={48} color="teal" turbulence={0.25} />
              </View>
              <Text weight="semibold" className="text-teal-400 text-center text-lg">
                GitHub Connected!
              </Text>
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
          style={organicBorderRadius.cta}
        >
          <Text className="text-neutral-300 text-center">Skip for Now</Text>
        </Pressable>

        {isConnected && (
          <Pressable
            onPress={handleContinue}
            className="flex-1 bg-coral-500 py-4 active:bg-coral-600"
            style={organicBorderRadius.cta}
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
