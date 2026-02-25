/**
 * Setup Screen
 *
 * Unified onboarding setup: GitHub auth + AI provider keys in collapsible sections.
 * Replaces the previous 3-page flow (github-auth -> api-keys -> create-project).
 */

import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SecurityIcon, SuccessIcon } from '@/components/icons';
import { env, GITHUB_OAUTH, PROVIDER_REGISTRY } from '@/config';
import { useOnboarding } from '@/contexts/onboarding';
import { CredentialService, GitHubAuthService } from '@/core';
import { useAppRouter } from '@/hooks/use-app-router';
import { logger } from '@/lib/logger';
import { type CredentialProvider, useCredentialStore } from '@/state';

function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

function SetupSection({
  title,
  subtitle,
  isOpen,
  onToggle,
  isDone,
  whyText,
  children,
}: Readonly<{
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  isDone: boolean;
  whyText: string;
  children: React.ReactNode;
}>) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="bg-surface rounded-organic-card shadow-organic-card overflow-hidden mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center gap-3 text-left tap-feedback"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-body font-semibold text-white">{title}</span>
            {isDone && <SuccessIcon size={18} color="teal" turbulence={0.15} />}
          </div>
          <span className="text-sm font-body text-neutral-500">{subtitle}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-neutral-400" />
        ) : (
          <ChevronDown size={18} className="text-neutral-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-neutral-700/50 pt-3">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1 text-xs font-body text-teal-400 mb-3 tap-feedback"
          >
            <HelpCircle size={14} />
            <span>Why?</span>
          </button>
          {showWhy && (
            <div className="bg-teal-600/10 p-3 mb-3 rounded-organic-badge">
              <p className="text-xs font-body text-teal-300">{whyText}</p>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: unified setup page with GitHub auth flow + provider key management
export default function SetupPage() {
  const router = useAppRouter();
  const { completeOnboarding } = useOnboarding();
  const cancelledRef = useRef(false);

  const [githubOpen, setGithubOpen] = useState(true);
  const [providersOpen, setProvidersOpen] = useState(false);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState('https://github.com/login/device');
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const addCredential = useCredentialStore((s) => s.addCredential);
  const setValidationResult = useCredentialStore((s) => s.setValidationResult);
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({});
  const [validatedProviders, setValidatedProviders] = useState<Set<string>>(new Set());
  const [validatingProvider, setValidatingProvider] = useState<string | null>(null);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      GitHubAuthService.cancel();
    };
  }, []);

  const startDeviceFlow = async () => {
    setIsAuthenticating(true);
    setGithubError(null);
    try {
      const result = await GitHubAuthService.startDeviceFlow({
        clientId: env.githubClientId,
        scopes: GITHUB_OAUTH.scopes,
        onStateChange: () => {},
        onError: (error) => {
          if (!cancelledRef.current) setGithubError(error);
        },
      });
      if (cancelledRef.current) return;
      if (result.success && result.data) {
        setUserCode(result.data.user_code);
        setVerificationUri(result.data.verification_uri);
      } else {
        setGithubError(result.error ?? 'Failed to start device flow');
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setGithubError(err instanceof Error ? err.message : 'Failed to start device flow');
      }
    } finally {
      if (!cancelledRef.current) setIsAuthenticating(false);
    }
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: auth polling with cancellation and error handling
  const checkAuth = async () => {
    setIsAuthenticating(true);
    setGithubError(null);
    try {
      const result = await GitHubAuthService.pollForToken({
        clientId: env.githubClientId,
        scopes: GITHUB_OAUTH.scopes,
        onPollAttempt: () => {},
        onError: (error) => {
          if (!cancelledRef.current) setGithubError(error);
        },
      });
      if (cancelledRef.current) return;
      if (result.authorized) {
        setIsGithubConnected(true);
        setGithubOpen(false);
        setProvidersOpen(true);
      } else if (result.error) {
        setGithubError(result.error);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setGithubError(err instanceof Error ? err.message : 'Authentication failed');
      }
    } finally {
      if (!cancelledRef.current) setIsAuthenticating(false);
    }
  };

  const handleProviderKeyChange = (providerId: string, value: string) => {
    setProviderKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const validateAndSaveKey = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: credential validation with store updates
    async (providerId: string) => {
      const key = providerKeys[providerId]?.trim();
      if (!key) return;

      const supportedProviders = ['anthropic', 'openai'];
      const provider = supportedProviders.includes(providerId)
        ? (providerId as 'anthropic' | 'openai')
        : null;

      setValidatingProvider(providerId);
      try {
        if (provider) {
          const result = await CredentialService.validateCredential(provider, key);
          if (result.isValid) {
            await CredentialService.store(provider, key);
            const credId = addCredential({
              provider: provider as CredentialProvider,
              name: providerId === 'anthropic' ? 'Anthropic' : 'OpenAI',
              secureStoreKey: providerId,
              maskedValue: CredentialService.maskSecret(key, provider),
            });
            setValidationResult(credId, { isValid: true, expiresAt: undefined });
          }
        }
        setValidatedProviders((prev) => new Set(prev).add(providerId));
        setProviderKeys((prev) => ({ ...prev, [providerId]: '' }));
      } catch (error) {
        logger.error(`Failed to validate ${providerId} key`, error);
      } finally {
        setValidatingProvider(null);
      }
    },
    [providerKeys, addCredential, setValidationResult]
  );

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  const onboardingProviders = PROVIDER_REGISTRY.filter((p) => p.tier >= 3).slice(0, 6);

  return (
    <div
      className="flex flex-col min-h-screen bg-charcoal animate-page-enter"
      data-testid="setup-screen"
    >
      <div className="flex-1 overflow-auto px-6 pt-6 pb-32 hide-scrollbar">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Set Up ThumbCode</h1>
          <p className="font-body text-neutral-400">
            Connect your accounts to get the most out of ThumbCode. You can skip and configure these
            later in Settings.
          </p>
        </div>

        <SetupSection
          title="GitHub"
          subtitle={isGithubConnected ? 'Connected' : 'Connect to access repositories'}
          isOpen={githubOpen}
          onToggle={() => setGithubOpen(!githubOpen)}
          isDone={isGithubConnected}
          whyText="GitHub access lets ThumbCode clone repos, create branches, commit code, and push changes — all from your phone."
        >
          {!isGithubConnected ? (
            <div className="flex flex-col gap-4">
              {!userCode ? (
                <button
                  type="button"
                  onClick={startDeviceFlow}
                  disabled={isAuthenticating}
                  className={`bg-neutral-800 py-3 rounded-organic-button font-body font-semibold text-white text-center transition-colors tap-feedback ${
                    isAuthenticating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-700'
                  }`}
                  data-testid="start-auth-button"
                >
                  {isAuthenticating ? <Spinner /> : 'Connect GitHub'}
                </button>
              ) : (
                <>
                  <div className="bg-charcoal p-4 rounded-organic-card text-center">
                    <p className="font-body text-sm text-neutral-400 mb-1">
                      Enter this code on GitHub:
                    </p>
                    <p className="font-display text-2xl font-bold text-coral-500 tracking-wider">
                      {userCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(verificationUri, '_blank', 'noopener,noreferrer')}
                    className="bg-neutral-800 py-3 rounded-organic-button font-body text-white text-center hover:bg-neutral-700 transition-colors tap-feedback"
                    data-testid="open-github-button"
                  >
                    Open GitHub &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={checkAuth}
                    disabled={isAuthenticating}
                    className={`bg-teal-600 py-3 rounded-organic-button font-body font-semibold text-white text-center transition-colors tap-feedback ${
                      isAuthenticating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700'
                    }`}
                    data-testid="check-auth-button"
                  >
                    {isAuthenticating ? <Spinner /> : "I've Entered the Code"}
                  </button>
                </>
              )}
              {githubError && (
                <p className="font-body text-sm text-coral-400 text-center">{githubError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-teal-400 font-body">
              <SuccessIcon size={18} color="teal" turbulence={0.15} />
              <span>GitHub connected successfully</span>
            </div>
          )}
        </SetupSection>

        <SetupSection
          title="AI Providers"
          subtitle={
            validatedProviders.size > 0
              ? `${validatedProviders.size} provider${validatedProviders.size > 1 ? 's' : ''} configured`
              : 'Add API keys to power AI agents'
          }
          isOpen={providersOpen}
          onToggle={() => setProvidersOpen(!providersOpen)}
          isDone={validatedProviders.size > 0}
          whyText="AI provider keys let ThumbCode's agents (Architect, Implementer, Reviewer, Tester) generate code, review changes, and run tests. Your keys never leave your device."
        >
          <div className="flex flex-col gap-3">
            <div className="bg-teal-600/10 p-3 rounded-organic-badge flex items-start gap-2">
              <SecurityIcon size={16} color="teal" turbulence={0.2} />
              <p className="font-body text-xs text-teal-300 flex-1">
                Keys are stored securely on your device using hardware-backed encryption.
              </p>
            </div>

            {onboardingProviders.map((provider) => (
              <div key={provider.providerId} className="bg-charcoal p-3 rounded-organic-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-medium text-white text-sm">
                      {provider.displayName}
                    </span>
                    {validatedProviders.has(provider.providerId) && (
                      <SuccessIcon size={14} color="teal" turbulence={0.15} />
                    )}
                  </div>
                  <span className="text-xs font-body text-neutral-500">Tier {provider.tier}</span>
                </div>
                {!validatedProviders.has(provider.providerId) && (
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={provider.authEnvVar}
                      value={providerKeys[provider.providerId] ?? ''}
                      onChange={(e) => handleProviderKeyChange(provider.providerId, e.target.value)}
                      className="flex-1 bg-surface border border-neutral-700 text-white font-mono text-xs px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                      data-testid={`setup-key-${provider.providerId}`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => validateAndSaveKey(provider.providerId)}
                      disabled={
                        !providerKeys[provider.providerId]?.trim() ||
                        validatingProvider === provider.providerId
                      }
                      className={`px-3 py-2 text-xs font-body font-medium rounded-organic-button transition-colors ${
                        providerKeys[provider.providerId]?.trim()
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      }`}
                      data-testid={`setup-save-${provider.providerId}`}
                    >
                      {validatingProvider === provider.providerId ? '...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <p className="font-body text-xs text-neutral-500 text-center">
              More providers available in Settings &rarr; AI Providers
            </p>
          </div>
        </SetupSection>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 border-t border-white/5 glass px-6 py-4 flex flex-row gap-4"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 bg-neutral-800 py-4 rounded-organic-button font-body text-neutral-300 text-center hover:bg-neutral-700 active:bg-neutral-600 transition-colors tap-feedback"
          data-testid="skip-button"
        >
          Skip for Now
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="flex-1 bg-coral-500 py-4 rounded-organic-button font-body font-semibold text-white text-center hover:bg-coral-600 active:bg-coral-700 transition-colors tap-feedback"
          data-testid="finish-button"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );
}
