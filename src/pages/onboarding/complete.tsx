/**
 * Complete Screen
 *
 * Final onboarding screen - celebrates completion and launches main app.
 * Uses paint daube icons for brand consistency.
 *
 * Migrated from React Native: app/(onboarding)/complete.tsx
 */

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
import { useOnboarding } from '@/contexts/onboarding';
import { useAppRouter } from '@/hooks/use-app-router';

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

export default function CompletePage() {
  const router = useAppRouter();
  const { completeOnboarding } = useOnboarding();

  // CSS-based entrance animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="complete-screen">
      <div className="flex-1 px-6 pt-6 pb-32">
        {/* Celebration */}
        <div className="flex flex-col items-center mt-12 mb-10">
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            <div className="w-32 h-32 bg-teal-600/20 flex items-center justify-center rounded-organic-hero">
              <CelebrateIcon size={64} color="gold" turbulence={0.3} />
            </div>
          </div>

          <div
            className={`flex flex-col items-center gap-2 mt-6 transition-all duration-500 delay-200 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h1 className="font-display text-3xl font-bold text-white text-center">
              You're All Set!
            </h1>
            <p className="font-body text-neutral-400 text-center">
              ThumbCode is ready. Start building amazing apps with your AI team.
            </p>
          </div>
        </div>

        {/* Capabilities */}
        <div
          className={`flex flex-col gap-2 transition-all duration-500 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="bg-surface p-4 flex flex-row items-center rounded-organic-button shadow-organic-card"
            >
              <div className="w-12 h-12 bg-charcoal flex items-center justify-center mr-4 rounded-organic-card">
                <cap.Icon size={24} color={cap.iconColor} turbulence={0.2} />
              </div>
              <div className="flex-1">
                <span className="font-body font-semibold text-white block">{cap.title}</span>
                <span className="font-body text-sm text-neutral-400">{cap.description}</span>
              </div>
              <SuccessIcon size={20} color="teal" turbulence={0.2} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-charcoal px-6 py-4 pb-8">
        <button
          type="button"
          onClick={handleGetStarted}
          className="w-full bg-coral-500 py-4 rounded-organic-button font-body font-semibold text-white text-center text-lg hover:bg-coral-600 active:bg-coral-700 transition-colors"
          data-testid="start-building-button"
        >
          Start Building &rarr;
        </button>
      </div>
    </div>
  );
}
