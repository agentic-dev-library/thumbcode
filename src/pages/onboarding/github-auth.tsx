/**
 * GitHub Auth Screen
 *
 * Guides user through GitHub Device Flow authentication.
 * Uses paint daube icons for brand consistency.
 *
 * Migrated from React Native: app/(onboarding)/github-auth.tsx
 */

import { useEffect, useRef, useState } from 'react';
import { StepsProgress } from '@/components/feedback/Progress';
import { LinkIcon, SuccessIcon } from '@/components/icons';
import { env, GITHUB_OAUTH } from '@/config';
import { GitHubAuthService } from '@/core';
import { useAppRouter } from '@/hooks/use-app-router';

/** Spinner component for loading states */
function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

export default function GitHubAuthPage() {
  const router = useAppRouter();
  const cancelledRef = useRef(false);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string>('https://github.com/login/device');
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<{ attempt: number; max: number } | null>(null);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      GitHubAuthService.cancel();
    };
  }, []);

  const startDeviceFlow = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setPollStatus(null);

    try {
      const result = await GitHubAuthService.startDeviceFlow({
        clientId: env.githubClientId,
        scopes: GITHUB_OAUTH.scopes,
        onStateChange: () => {},
        onError: (error) => {
          if (!cancelledRef.current) {
            setErrorMessage(error);
          }
        },
      });

      if (cancelledRef.current) return;

      if (result.success && result.data) {
        setUserCode(result.data.user_code);
        setVerificationUri(result.data.verification_uri);
      } else {
        setErrorMessage(result.error ?? 'Failed to start device flow');
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to start device flow');
      }
    } finally {
      if (!cancelledRef.current) {
        setIsAuthenticating(false);
      }
    }
  };

  const openGitHub = () => {
    window.open(verificationUri, '_blank', 'noopener,noreferrer');
  };

  const checkAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);

    try {
      const result = await GitHubAuthService.pollForToken({
        clientId: env.githubClientId,
        scopes: GITHUB_OAUTH.scopes,
        onPollAttempt: (attempt, maxAttempts) => {
          if (!cancelledRef.current) {
            setPollStatus({ attempt, max: maxAttempts });
          }
        },
        onError: (error) => {
          if (!cancelledRef.current) {
            setErrorMessage(error);
          }
        },
      });

      if (cancelledRef.current) return;

      if (result.authorized) {
        setIsConnected(true);
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
      }
    } finally {
      if (!cancelledRef.current) {
        setIsAuthenticating(false);
      }
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/api-keys');
  };

  const handleContinue = () => {
    router.push('/onboarding/api-keys');
  };

  return (
    <div className="flex flex-col min-h-screen bg-charcoal" data-testid="github-auth-screen">
      <div className="flex-1 px-6 pt-6 pb-32">
        {/* Progress Steps */}
        <StepsProgress
          totalSteps={4}
          currentStep={1}
          labels={['GitHub', 'API Keys', 'Project', 'Done']}
        />

        {/* Header */}
        <div className="flex flex-col gap-2 mt-8 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Connect GitHub</h1>
          <p className="font-body text-neutral-400">
            Link your GitHub account to access repositories and enable code commits from ThumbCode.
          </p>
        </div>

        {/* Device Code Flow - Before Connection */}
        {!isConnected && (
          <div className="flex flex-col gap-6">
            {!userCode ? (
              /* Initial state - start device flow */
              <div className="flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-organic-card shadow-organic-card">
                  <div className="flex justify-center mb-4">
                    <LinkIcon size={40} color="teal" turbulence={0.25} />
                  </div>
                  <p className="font-body font-semibold text-white text-center mb-2">
                    Secure Device Flow
                  </p>
                  <p className="font-body text-sm text-neutral-400 text-center">
                    We use GitHub's Device Flow authentication - your credentials are never shared
                    with us.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startDeviceFlow}
                  disabled={isAuthenticating}
                  className={`bg-neutral-800 py-4 rounded-organic-button font-body font-semibold text-white text-center transition-colors ${
                    isAuthenticating
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-neutral-700 active:bg-neutral-600'
                  }`}
                  data-testid="start-auth-button"
                >
                  {isAuthenticating ? (
                    <span className="flex items-center justify-center">
                      <Spinner />
                    </span>
                  ) : (
                    'Start GitHub Authentication'
                  )}
                </button>
              </div>
            ) : (
              /* Code displayed - waiting for user to enter on GitHub */
              <div className="flex flex-col gap-6">
                <div className="bg-surface p-6 rounded-organic-card shadow-organic-card">
                  <p className="font-body text-sm text-neutral-400 text-center mb-2">
                    Enter this code on GitHub:
                  </p>
                  <p className="font-display text-3xl font-bold text-coral-500 text-center tracking-wider">
                    {userCode}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openGitHub}
                  className="bg-neutral-800 py-4 rounded-organic-button font-body font-semibold text-white text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
                  data-testid="open-github-button"
                >
                  Open GitHub &rarr;
                </button>

                <button
                  type="button"
                  onClick={checkAuth}
                  disabled={isAuthenticating}
                  className={`bg-teal-600 py-4 rounded-organic-button font-body font-semibold text-white text-center transition-colors ${
                    isAuthenticating
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-teal-700 active:bg-teal-800'
                  }`}
                  data-testid="check-auth-button"
                >
                  {isAuthenticating ? (
                    <span className="flex items-center justify-center">
                      <Spinner />
                    </span>
                  ) : (
                    "I've Entered the Code"
                  )}
                </button>
              </div>
            )}

            {/* Polling Status */}
            {pollStatus && (
              <p className="font-body text-sm text-neutral-500 text-center">
                Checking authorization... {pollStatus.attempt}/{pollStatus.max}
              </p>
            )}

            {/* Error Message */}
            {errorMessage && (
              <p className="font-body text-sm text-coral-400 text-center">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Success State */}
        {isConnected && (
          <div className="flex flex-col gap-6">
            <div className="bg-teal-600/20 p-6 rounded-organic-card">
              <div className="flex justify-center mb-4">
                <SuccessIcon size={48} color="teal" turbulence={0.25} />
              </div>
              <p className="font-body font-semibold text-teal-400 text-center text-lg">
                GitHub Connected!
              </p>
              <p className="font-body text-sm text-neutral-400 text-center mt-2">
                You can now access your repositories and push code from ThumbCode.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-charcoal px-6 py-4 pb-8 flex flex-row gap-4">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 rounded-organic-button font-body text-neutral-300 text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
          data-testid="skip-button"
        >
          Skip for Now
        </button>

        {isConnected && (
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 bg-coral-500 py-4 rounded-organic-button font-body font-semibold text-white text-center hover:bg-coral-600 active:bg-coral-700 transition-colors"
            data-testid="continue-button"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
