/**
 * Complete Screen
 *
 * Final onboarding screen - celebrates completion and launches main app.
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { useOnboarding } from '@/contexts/onboarding';

const CAPABILITIES = [
  { icon: '🤖', title: 'AI Agent Teams', description: 'Multi-agent collaboration ready' },
  { icon: '📱', title: 'Mobile Git', description: 'Clone, commit, push from your phone' },
  { icon: '💬', title: 'Real-time Chat', description: 'Direct agent communication' },
  { icon: '📊', title: 'Progress Tracking', description: 'Monitor tasks and metrics' },
];

export default function CompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleGetStarted = async () => {
    // Mark onboarding as complete in storage
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-charcoal" style={{ paddingTop: insets.top }}>
      <Container padding="lg" className="flex-1">
        {/* Celebration */}
        <VStack align="center" className="mt-12 mb-10">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }}
          >
            <View
              className="w-32 h-32 bg-teal-600/20 items-center justify-center"
              style={{
                borderTopLeftRadius: 40,
                borderTopRightRadius: 36,
                borderBottomRightRadius: 44,
                borderBottomLeftRadius: 32,
              }}
            >
              <Text className="text-6xl">🎉</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <VStack spacing="sm" align="center" className="mt-6">
              <Text variant="display" size="3xl" weight="bold" className="text-white text-center">
                You're All Set!
              </Text>
              <Text className="text-neutral-400 text-center">
                ThumbCode is ready. Start building amazing apps with your AI team.
              </Text>
            </VStack>
          </Animated.View>
        </VStack>

        {/* Capabilities */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <VStack spacing="sm">
            {CAPABILITIES.map((cap) => (
              <View
                key={cap.title}
                className="bg-surface p-4 flex-row items-center"
                style={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 14,
                  borderBottomLeftRadius: 8,
                }}
              >
                <View
                  className="w-12 h-12 bg-charcoal items-center justify-center mr-4"
                  style={{
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 16,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Text className="text-2xl">{cap.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text weight="semibold" className="text-white">
                    {cap.title}
                  </Text>
                  <Text size="sm" className="text-neutral-400">
                    {cap.description}
                  </Text>
                </View>
                <Text className="text-teal-400">✓</Text>
              </View>
            ))}
          </VStack>
        </Animated.View>
      </Container>

      {/* Bottom CTA */}
      <View
        className="border-t border-neutral-800 px-6 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleGetStarted}
          className="bg-coral-500 py-4 active:bg-coral-600"
          style={{
            borderTopLeftRadius: 14,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 18,
          }}
        >
          <Text weight="semibold" className="text-white text-center text-lg">
            Start Building →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
