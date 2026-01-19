/**
 * GitHub Auth Screen
 *
 * Guides user through GitHub Device Flow authentication.
 * Uses paint daube icons for brand consistency.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsProgress } from '@/components/feedback';
import { LinkIcon, SuccessIcon } from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';

export default function GitHubAuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const startDeviceFlow = async () => {
    setIsAuthenticating(true);
    // TODO: Implement actual GitHub Device Flow
    // For now, simulate the flow
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUserCode('ABCD-1234');
    setIsAuthenticating(false);
  };

  const openGitHub = async () => {
    await Linking.openURL('https://github.com/login/device');
  };

  const checkAuth = async () => {
    setIsAuthenticating(true);
    // TODO: Poll for authorization completion
    await new Promise((resolve) => setTimeout(resolve, 1500));
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
              disabled={isAuthenticating}
              className={`bg-neutral-800 py-4 ${isAuthenticating ? 'opacity-70' : 'active:bg-neutral-700'}`}
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 18,
              }}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text weight="semibold" className="text-white text-center">
                  Start GitHub Authentication
                </Text>
              )}
            </Pressable>
          </VStack>
        )}

        {userCode && !isConnected && (
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
            </View>

            <Pressable
              onPress={openGitHub}
              className="bg-neutral-800 py-4 active:bg-neutral-700"
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
              onPress={checkAuth}
              disabled={isAuthenticating}
              className={`bg-teal-600 py-4 ${isAuthenticating ? 'opacity-70' : 'active:bg-teal-700'}`}
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 18,
              }}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text weight="semibold" className="text-white text-center">
                  I've Entered the Code
                </Text>
              )}
            </Pressable>
          </VStack>
        )}

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
