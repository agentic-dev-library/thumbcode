/**
 * Welcome Screen
 *
 * First screen of onboarding flow. Introduces ThumbCode and its features.
 */

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VStack } from '@/components/layout';
import { Text } from '@/components/ui';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Agent Teams',
    description: 'Architect, Implementer, Reviewer, and Tester agents work in parallel',
  },
  {
    icon: '📱',
    title: 'Mobile-First Git',
    description: 'Full git workflow from your phone with isomorphic-git',
  },
  {
    icon: '🔐',
    title: 'Your Keys, Your Control',
    description: 'API keys never leave your device - stored in secure hardware',
  },
  {
    icon: '⚡',
    title: 'Zero Server Costs',
    description: 'Bring your own keys - no subscriptions, no vendor lock-in',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <VStack spacing="md" align="center" className="mt-12 mb-10">
          <View
            className="w-24 h-24 bg-coral-500 items-center justify-center"
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 32,
              borderBottomLeftRadius: 20,
            }}
          >
            <Text className="text-5xl">👍</Text>
          </View>

          <Text variant="display" size="4xl" weight="bold" className="text-coral-500 text-center">
            ThumbCode
          </Text>

          <Text className="text-neutral-400 text-center text-lg">
            Code with your thumbs. Ship apps from your phone.
          </Text>
        </VStack>

        {/* Features */}
        <VStack spacing="md" className="mb-8">
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              className="bg-surface p-4 flex-row items-start"
              style={{
                borderTopLeftRadius: 14,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 16,
                borderBottomLeftRadius: 10,
              }}
            >
              <Text className="text-2xl mr-4">{feature.icon}</Text>
              <View className="flex-1">
                <Text weight="semibold" className="text-white mb-1">
                  {feature.title}
                </Text>
                <Text size="sm" className="text-neutral-400">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </VStack>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-charcoal border-t border-neutral-800 px-6 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={() => router.push('/(onboarding)/github-auth')}
          className="bg-coral-500 py-4 active:bg-coral-600"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 18,
          }}
        >
          <Text weight="semibold" className="text-white text-center text-lg">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
