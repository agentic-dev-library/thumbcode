/**
 * Welcome Screen
 *
 * First screen of onboarding. Animated logo, tagline, three feature pills.
 * Single "Get Started" CTA — no progress stepper.
 */

import { useEffect, useState } from 'react';
import { ThumbIcon } from '@/components/icons';
import { useAppRouter } from '@/hooks/use-app-router';

const FEATURE_PILLS = [
  { emoji: '\u{1F916}', label: 'AI Agent Teams' },
  { emoji: '\u{1F4F1}', label: 'Mobile-First Git' },
  { emoji: '\u{1F510}', label: 'Your Keys, Your Device' },
] as const;

export default function WelcomePage() {
  const router = useAppRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="welcome-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        {/* Animated Logo */}
        <div
          className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="w-28 h-28 bg-coral-500 flex items-center justify-center rounded-organic-hero mb-6">
            <ThumbIcon size={56} color="charcoal" turbulence={0.2} />
          </div>
        </div>

        {/* Title + Tagline */}
        <div
          className={`flex flex-col items-center gap-3 mb-10 transition-all duration-500 delay-200 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="font-display text-4xl font-bold text-coral-500 text-center">ThumbCode</h1>
          <p className="font-body text-lg text-neutral-400 text-center max-w-[300px]">
            Code with your thumbs. Ship apps from your phone.
          </p>
        </div>

        {/* Feature Pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 transition-all duration-500 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {FEATURE_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="bg-surface px-4 py-2 rounded-organic-badge font-body text-sm text-neutral-300 shadow-organic-card"
            >
              {pill.emoji} {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-6 py-4"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => router.push('/onboarding/setup')}
          className="w-full bg-coral-500 py-4 font-body font-semibold text-white text-center text-lg rounded-organic-button hover:bg-coral-600 active:bg-coral-700 transition-colors tap-feedback"
          data-testid="get-started-button"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
