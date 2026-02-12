/**
 * DeviceCodeDisplay
 *
 * Shows the device code for GitHub Device Flow authentication,
 * with a button to open GitHub.
 */

import { ActivityIndicator, Pressable, View } from 'react-native';
import { LinkIcon } from '@/components/icons';
import { VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

interface DeviceCodeDisplayProps {
  userCode: string | null;
  isAuthenticating: boolean;
  onStartDeviceFlow: () => void;
  onOpenGitHub: () => void;
  onCheckAuth: () => void;
}

export function DeviceCodeDisplay({
  userCode,
  isAuthenticating,
  onStartDeviceFlow,
  onOpenGitHub,
  onCheckAuth,
}: Readonly<DeviceCodeDisplayProps>) {
  if (!userCode) {
    return (
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
          onPress={onStartDeviceFlow}
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
      </VStack>
    );
  }

  return (
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
        onPress={onOpenGitHub}
        className="bg-neutral-800 py-4 active:bg-neutral-700"
        style={organicBorderRadius.cta}
      >
        <Text weight="semibold" className="text-white text-center">
          Open GitHub →
        </Text>
      </Pressable>

      <Pressable
        onPress={onCheckAuth}
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
    </VStack>
  );
}
