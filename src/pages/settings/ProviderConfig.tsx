/**
 * Provider Config Page
 *
 * Shows all AI providers from the registry with their capabilities.
 * Users can enable/disable providers, enter API keys, and see
 * capability badges color-coded by category.
 */

import {
  type CapabilitySupport,
  PROVIDER_REGISTRY,
  type ProviderCapability,
  type ProviderCapabilityEntry,
} from '@/config';
import { useCredentialStore } from '@/state';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Capability category for color coding.
 */
type CapabilityCategory = 'generation' | 'analysis' | 'vision' | 'other';

function getCapabilityCategory(cap: ProviderCapability): CapabilityCategory {
  switch (cap) {
    case 'textGeneration':
    case 'streaming':
    case 'imageGeneration':
    case 'audioOutput':
    case 'codeExecution':
      return 'generation';
    case 'structuredOutput':
    case 'embeddings':
    case 'promptCaching':
    case 'thinking':
    case 'searchGrounding':
      return 'analysis';
    case 'imageInput':
    case 'pdfInput':
    case 'audioInput':
      return 'vision';
    default:
      return 'other';
  }
}

const CATEGORY_BADGE_COLORS: Record<CapabilityCategory, string> = {
  generation: 'bg-coral-500/20 text-coral-400',
  analysis: 'bg-teal-500/20 text-teal-400',
  vision: 'bg-gold-400/20 text-gold-400',
  other: 'bg-neutral-500/20 text-neutral-400',
};

const CAPABILITY_LABELS: Record<ProviderCapability, string> = {
  textGeneration: 'Text',
  streaming: 'Stream',
  structuredOutput: 'Structured',
  toolCalling: 'Tools',
  toolStreaming: 'Tool Stream',
  imageInput: 'Vision',
  imageGeneration: 'Image Gen',
  embeddings: 'Embeddings',
  promptCaching: 'Caching',
  thinking: 'Thinking',
  searchGrounding: 'Search',
  pdfInput: 'PDF',
  audioInput: 'Audio In',
  audioOutput: 'Audio Out',
  codeExecution: 'Code Exec',
};

const TIER_LABELS: Record<number, string> = {
  4: 'Full-Featured',
  3: 'Advanced',
  2: 'Standard',
  1: 'Basic',
};

const TIER_COLORS: Record<number, string> = {
  4: 'text-coral-400',
  3: 'text-teal-400',
  2: 'text-gold-400',
  1: 'text-neutral-400',
};

function CapabilityBadge({
  capability,
  support,
}: Readonly<{ capability: ProviderCapability; support: CapabilitySupport }>) {
  if (support === 'none') return null;

  const category = getCapabilityCategory(capability);
  const colorClass = CATEGORY_BADGE_COLORS[category];
  const label = CAPABILITY_LABELS[capability];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium font-body rounded-organic-badge ${colorClass}`}
      data-testid={`capability-${capability}`}
    >
      {label}
      {support === 'partial' && (
        <span className="ml-0.5 opacity-60" title="Partial support">
          *
        </span>
      )}
    </span>
  );
}

function ProviderCard({
  provider,
  isEnabled,
  hasApiKey,
  onToggle,
  apiKeyValue,
  onApiKeyChange,
  onApiKeySave,
}: Readonly<{
  provider: ProviderCapabilityEntry;
  isEnabled: boolean;
  hasApiKey: boolean;
  onToggle: () => void;
  apiKeyValue: string;
  onApiKeyChange: (value: string) => void;
  onApiKeySave: () => void;
}>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const supportedCapabilities = (
    Object.entries(provider.capabilities) as [ProviderCapability, CapabilitySupport][]
  ).filter(([, support]) => support !== 'none');

  const tierLabel = TIER_LABELS[provider.tier] ?? 'Unknown';
  const tierColor = TIER_COLORS[provider.tier] ?? 'text-neutral-400';

  return (
    <div
      className="bg-surface-elevated rounded-organic-card shadow-organic-card overflow-hidden mb-3"
      style={{ transform: 'rotate(-0.15deg)' }}
      data-testid={`provider-card-${provider.providerId}`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-organic-badge bg-charcoal flex items-center justify-center shrink-0">
          <span className="text-white font-body font-semibold text-sm">
            {provider.displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-body font-medium">{provider.displayName}</span>
            <span className={`text-xs font-body font-medium ${tierColor}`}>{tierLabel}</span>
            {hasApiKey && (
              <span className="text-xs font-body font-medium text-teal-400 bg-teal-600/20 px-1.5 py-0.5 rounded-organic-badge">
                Active
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500 font-mono">{provider.packageName}</span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer mr-2">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={onToggle}
            aria-label={`Enable ${provider.displayName}`}
            data-testid={`toggle-${provider.providerId}`}
          />
          <div className="w-11 h-6 bg-neutral-700 peer-checked:bg-teal-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-neutral-50 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-neutral-500 hover:text-white transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          data-testid={`expand-${provider.providerId}`}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-700/50 pt-3">
          {/* Capabilities */}
          <div className="mb-3">
            <span className="text-xs text-neutral-500 font-body font-semibold block mb-2">
              CAPABILITIES
            </span>
            <div className="flex flex-wrap gap-1.5">
              {supportedCapabilities.map(([cap, support]) => (
                <CapabilityBadge key={cap} capability={cap} support={support} />
              ))}
            </div>
          </div>

          {/* Quirks */}
          {provider.quirks.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-neutral-500 font-body font-semibold block mb-1">
                NOTES
              </span>
              <ul className="text-xs text-neutral-400 font-body space-y-0.5">
                {provider.quirks.map((quirk) => (
                  <li key={quirk} className="flex items-start gap-1.5">
                    <span className="text-neutral-600 mt-0.5 shrink-0">-</span>
                    <span>{quirk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* API Key Input */}
          {isEnabled && (
            <div>
              <span className="text-xs text-neutral-500 font-body font-semibold block mb-1">
                API KEY ({provider.authEnvVar})
              </span>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyValue}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder={hasApiKey ? '••••••••••••' : `Enter ${provider.authEnvVar}`}
                    className="w-full bg-charcoal border border-neutral-700 text-white font-mono text-sm px-3 py-2 pr-10 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                    data-testid={`api-key-${provider.providerId}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onApiKeySave}
                  disabled={!apiKeyValue.trim()}
                  className={`px-4 py-2 text-sm font-body font-medium rounded-organic-button transition-colors ${
                    apiKeyValue.trim()
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  }`}
                  data-testid={`save-key-${provider.providerId}`}
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ProviderConfig() {
  const navigate = useNavigate();
  const credentials = useCredentialStore((s) => s.credentials);
  const addCredential = useCredentialStore((s) => s.addCredential);

  // Track enabled state and API key inputs locally
  const [enabledProviders, setEnabledProviders] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const cred of credentials) {
      if (cred.provider === 'anthropic' || cred.provider === 'openai') {
        set.add(cred.provider);
      }
    }
    return set;
  });
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const toggleProvider = (providerId: string) => {
    setEnabledProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  };

  const handleApiKeyChange = (providerId: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const handleApiKeySave = (provider: ProviderCapabilityEntry) => {
    const key = apiKeys[provider.providerId];
    if (!key?.trim()) return;

    // Map to credential provider type (only anthropic/openai/github/custom supported)
    const providerType =
      provider.providerId === 'anthropic' || provider.providerId === 'openai'
        ? provider.providerId
        : 'custom';

    addCredential({
      provider: providerType,
      name: provider.displayName,
      secureStoreKey: `credential-${provider.providerId}`,
      maskedValue: `${key.slice(0, 4)}...${key.slice(-4)}`,
    });

    // Clear the input
    setApiKeys((prev) => ({ ...prev, [provider.providerId]: '' }));
  };

  const hasApiKey = (providerId: string) => {
    return credentials.some(
      (c) =>
        (c.provider === providerId || c.secureStoreKey === `credential-${providerId}`) &&
        (c.status === 'valid' || c.status === 'unknown')
    );
  };

  // Group providers by tier
  const tierGroups = [4, 3, 2, 1]
    .map((tier) => ({
      tier,
      label: TIER_LABELS[tier],
      providers: PROVIDER_REGISTRY.filter((p) => p.tier === tier),
    }))
    .filter((g) => g.providers.length > 0);

  return (
    <div className="flex-1 bg-charcoal min-h-screen">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body"
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body">AI Providers</h1>
        <p className="text-sm text-neutral-500 font-body mt-1">
          Configure AI provider API keys and capabilities
        </p>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-6">
        {tierGroups.map((group) => (
          <div key={group.tier} className="mb-6">
            <div className="bg-surface rounded-organic-card shadow-organic-card overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700">
                <span className="text-sm font-semibold text-neutral-400 font-body">
                  TIER {group.tier}: {group.label?.toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                {group.providers.map((provider) => (
                  <ProviderCard
                    key={provider.providerId}
                    provider={provider}
                    isEnabled={enabledProviders.has(provider.providerId)}
                    hasApiKey={hasApiKey(provider.providerId)}
                    onToggle={() => toggleProvider(provider.providerId)}
                    apiKeyValue={apiKeys[provider.providerId] ?? ''}
                    onApiKeyChange={(v) => handleApiKeyChange(provider.providerId, v)}
                    onApiKeySave={() => handleApiKeySave(provider)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
