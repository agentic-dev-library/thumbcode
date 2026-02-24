/**
 * Welcome Screen
 *
 * First screen of onboarding flow. Introduces ThumbCode and its features.
 * Uses Lucide-based paint daube icons for brand consistency.
 *
 * Migrated from React Native: app/(onboarding)/welcome.tsx
 */

import {
  AgentIcon,
  type IconVariant,
  LightningIcon,
  MobileIcon,
  SecurityIcon,
  ThumbIcon,
} from '@/components/icons';
import { useAppRouter } from '@/hooks/use-app-router';

interface Feature {
  icon: IconVariant;
  title: string;
  description: string;
  color: 'coral' | 'teal' | 'gold';
}

const FEATURES: Feature[] = [
  {
    icon: 'agent',
    title: 'AI Agent Teams',
    description: 'Architect, Implementer, Reviewer, and Tester agents work in parallel',
    color: 'coral',
  },
  {
    icon: 'mobile',
    title: 'Mobile-First Git',
    description: 'Full git workflow from your phone with isomorphic-git',
    color: 'teal',
  },
  {
    icon: 'security',
    title: 'Your Keys, Your Control',
    description: 'API keys never leave your device - stored in secure hardware',
    color: 'gold',
  },
  {
    icon: 'lightning',
    title: 'Zero Server Costs',
    description: 'Bring your own keys - no subscriptions, no vendor lock-in',
    color: 'coral',
  },
];

/** Feature icon component that renders the appropriate paint daube icon */
function FeatureIcon({ variant, color }: { variant: IconVariant; color: Feature['color'] }) {
  const iconProps = { size: 28, color, turbulence: 0.25 } as const;

  switch (variant) {
    case 'agent':
      return <AgentIcon {...iconProps} />;
    case 'mobile':
      return <MobileIcon {...iconProps} />;
    case 'security':
      return <SecurityIcon {...iconProps} />;
    case 'lightning':
      return <LightningIcon {...iconProps} />;
    default:
      return <AgentIcon {...iconProps} />;
  }
}

export default function WelcomePage() {
  const router = useAppRouter();

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="welcome-screen">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 pb-32">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 mt-12 mb-10">
          <div className="w-24 h-24 bg-coral-500 flex items-center justify-center rounded-organic-hero">
            <ThumbIcon size={48} color="charcoal" turbulence={0.2} />
          </div>

          <h1 className="font-display text-4xl font-bold text-coral-500 text-center">ThumbCode</h1>

          <p className="font-body text-lg text-neutral-400 text-center">
            Code with your thumbs. Ship apps from your phone.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-4 mb-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface p-4 flex flex-row items-start rounded-organic-card shadow-organic-card"
            >
              <div className="mr-4">
                <FeatureIcon variant={feature.icon} color={feature.color} />
              </div>
              <div className="flex-1">
                <span className="font-body font-semibold text-white block mb-1">
                  {feature.title}
                </span>
                <span className="font-body text-sm text-neutral-400">{feature.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-charcoal border-t border-neutral-800 px-6 py-4"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => router.push('/onboarding/github-auth')}
          className="w-full bg-coral-500 py-4 font-body font-semibold text-white text-center text-lg rounded-organic-button hover:bg-coral-600 active:bg-coral-700 transition-colors"
          data-testid="get-started-button"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
