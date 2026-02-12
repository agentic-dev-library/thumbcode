/**
 * Complete Screen
 *
 * Final onboarding screen - celebrates completion and launches main app.
 * Uses paint daube icons for brand consistency.
 */

import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  AgentIcon,
  CelebrateIcon,
  ChatIcon,
  type IconColor,
  MobileIcon,
  SuccessIcon,
  TasksIcon,
} from '@/components/icons';
import { Container, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { useOnboarding } from '@/contexts/onboarding';
import { organicBorderRadius } from '@/lib/organic-styles';

type CapabilityIcon = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

interface Capability {
  Icon: CapabilityIcon;
  iconColor: IconColor;
  title: string;
  description: string;
}

const CAPABILITIES: Capability[] = [
  {
    Icon: AgentIcon,
    iconColor: 'coral',
    title: 'AI Agent Teams',
    description: 'Multi-agent collaboration ready',
  },
  {
    Icon: MobileIcon,
    iconColor: 'teal',
    title: 'Mobile Git',
    description: 'Clone, commit, push from your phone',
  },
  {
    Icon: ChatIcon,
    iconColor: 'gold',
    title: 'Real-time Chat',
    description: 'Direct agent communication',
  },
  {
    Icon: TasksIcon,
    iconColor: 'teal',
    title: 'Progress Tracking',
    description: 'Monitor tasks and metrics',
  },
];

export default function CompleteScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleGetStarted = async () => {
    // Mark onboarding as complete in storage
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <div className="flex-1 bg-charcoal">
      <Container padding="lg" className="flex-1">
        {/* Celebration */}
        <VStack align="center" className="mt-12 mb-10">
          <div
            style={{
              transform: isVisible ? 'scale(1)' : 'scale(0.5)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease',
            }}
          >
            <div
              className="w-32 h-32 bg-teal-600/20 items-center justify-center"
              style={organicBorderRadius.hero}
            >
              <CelebrateIcon size={64} color="gold" turbulence={0.3} />
            </div>
          </div>

          <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <VStack spacing="sm" align="center" className="mt-6">
              <Text variant="display" size="3xl" weight="bold" className="text-white text-center">
                You're All Set!
              </Text>
              <Text className="text-neutral-400 text-center">
                ThumbCode is ready. Start building amazing apps with your AI team.
              </Text>
            </VStack>
          </div>
        </VStack>

        {/* Capabilities */}
        <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}>
          <VStack spacing="sm">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="bg-surface p-4 flex-row items-center"
                style={organicBorderRadius.button}
              >
                <div
                  className="w-12 h-12 bg-charcoal items-center justify-center mr-4"
                  style={organicBorderRadius.card}
                >
                  <cap.Icon size={24} color={cap.iconColor} turbulence={0.2} />
                </div>
                <div className="flex-1">
                  <Text weight="semibold" className="text-white">
                    {cap.title}
                  </Text>
                  <Text size="sm" className="text-neutral-400">
                    {cap.description}
                  </Text>
                </div>
                <SuccessIcon size={20} color="teal" turbulence={0.2} />
              </div>
            ))}
          </VStack>
        </div>
      </Container>

      {/* Bottom CTA */}
      <div
        className="border-t border-neutral-800 px-6 py-4 pb-8"
      >
        <button type="button"
          onClick={handleGetStarted}
          className="bg-coral-500 py-4 active:bg-coral-600"
          style={organicBorderRadius.cta}
        >
          <Text weight="semibold" className="text-white text-center text-lg">
            Start Building →
          </Text>
        </button>
      </div>
    </div>
  );
}
