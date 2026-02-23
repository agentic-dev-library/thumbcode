/**
 * Provider Capability Registry Tests
 *
 * Verifies the provider registry entries, capability queries,
 * tier assignments, and validation logic.
 */

import {
  getProvider,
  getProvidersWithCapability,
  getProviderTier,
  PROVIDER_REGISTRY,
  type ProviderCapability,
  type ProviderCapabilityEntry,
  supportsCapability,
  validateProviderForTask,
} from '../provider-registry';

const ALL_CAPABILITIES: ProviderCapability[] = [
  'textGeneration',
  'streaming',
  'structuredOutput',
  'toolCalling',
  'toolStreaming',
  'imageInput',
  'imageGeneration',
  'embeddings',
  'promptCaching',
  'thinking',
  'searchGrounding',
  'pdfInput',
  'audioInput',
  'audioOutput',
  'codeExecution',
];

describe('Provider Registry', () => {
  describe('registry structure', () => {
    it('contains at least 10 providers', () => {
      expect(PROVIDER_REGISTRY.length).toBeGreaterThanOrEqual(10);
    });

    it('has unique provider IDs', () => {
      const ids = PROVIDER_REGISTRY.map((p) => p.providerId);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(
      PROVIDER_REGISTRY.map((p) => [p.providerId, p])
    )('%s has all required fields', (_id, provider) => {
      const p = provider as ProviderCapabilityEntry;
      expect(p.providerId).toBeTruthy();
      expect(p.packageName).toMatch(/^@ai-sdk\//);
      expect(p.displayName).toBeTruthy();
      expect(p.authEnvVar).toBeTruthy();
      expect([1, 2, 3, 4]).toContain(p.tier);
      expect(Array.isArray(p.quirks)).toBe(true);
    });

    it.each(
      PROVIDER_REGISTRY.map((p) => [p.providerId, p])
    )('%s has all capability fields defined', (_id, provider) => {
      const p = provider as ProviderCapabilityEntry;
      for (const cap of ALL_CAPABILITIES) {
        expect(p.capabilities[cap]).toBeDefined();
        expect(['full', 'partial', 'none']).toContain(p.capabilities[cap]);
      }
    });
  });

  describe('tier assignments', () => {
    it('assigns tier 4 to OpenAI', () => {
      expect(getProviderTier('openai')).toBe(4);
    });

    it('assigns tier 4 to Anthropic', () => {
      expect(getProviderTier('anthropic')).toBe(4);
    });

    it('assigns tier 4 to Google', () => {
      expect(getProviderTier('google')).toBe(4);
    });

    it('assigns tier 4 to Azure', () => {
      expect(getProviderTier('azure')).toBe(4);
    });

    it('assigns tier 4 to xAI', () => {
      expect(getProviderTier('xai')).toBe(4);
    });

    it('assigns tier 3 to Amazon Bedrock', () => {
      expect(getProviderTier('amazon-bedrock')).toBe(3);
    });

    it('assigns tier 2 to Mistral, Cohere, Groq, DeepSeek', () => {
      expect(getProviderTier('mistral')).toBe(2);
      expect(getProviderTier('cohere')).toBe(2);
      expect(getProviderTier('groq')).toBe(2);
      expect(getProviderTier('deepseek')).toBe(2);
    });

    it('returns 0 for unknown providers', () => {
      expect(getProviderTier('nonexistent')).toBe(0);
    });
  });

  describe('supportsCapability', () => {
    it('OpenAI supports all capabilities', () => {
      for (const cap of ALL_CAPABILITIES) {
        expect(supportsCapability('openai', cap)).toBe(true);
      }
    });

    it('Anthropic does not support imageGeneration', () => {
      expect(supportsCapability('anthropic', 'imageGeneration')).toBe(false);
    });

    it('Anthropic does not support embeddings', () => {
      expect(supportsCapability('anthropic', 'embeddings')).toBe(false);
    });

    it('Anthropic does not support audioInput or audioOutput', () => {
      expect(supportsCapability('anthropic', 'audioInput')).toBe(false);
      expect(supportsCapability('anthropic', 'audioOutput')).toBe(false);
    });

    it('Google supports searchGrounding', () => {
      expect(supportsCapability('google', 'searchGrounding')).toBe(true);
    });

    it('Mistral has partial imageInput (Pixtral only)', () => {
      const provider = getProvider('mistral');
      expect(provider?.capabilities.imageInput).toBe('partial');
    });

    it('Groq has partial structuredOutput', () => {
      const provider = getProvider('groq');
      expect(provider?.capabilities.structuredOutput).toBe('partial');
    });

    it('DeepSeek supports thinking and promptCaching', () => {
      expect(supportsCapability('deepseek', 'thinking')).toBe(true);
      expect(supportsCapability('deepseek', 'promptCaching')).toBe(true);
    });

    it('returns false for unknown providers', () => {
      expect(supportsCapability('nonexistent', 'textGeneration')).toBe(false);
    });
  });

  describe('getProvidersWithCapability', () => {
    it('returns all providers for textGeneration', () => {
      const providers = getProvidersWithCapability('textGeneration');
      expect(providers.length).toBe(PROVIDER_REGISTRY.length);
    });

    it('returns subset for imageGeneration', () => {
      const providers = getProvidersWithCapability('imageGeneration');
      expect(providers.length).toBeLessThan(PROVIDER_REGISTRY.length);
      expect(providers.map((p) => p.providerId)).toContain('openai');
      expect(providers.map((p) => p.providerId)).not.toContain('anthropic');
    });

    it('returns providers with searchGrounding', () => {
      const providers = getProvidersWithCapability('searchGrounding');
      const ids = providers.map((p) => p.providerId);
      expect(ids).toContain('openai');
      expect(ids).toContain('google');
      expect(ids).toContain('anthropic');
      expect(ids).toContain('cohere');
      expect(ids).toContain('xai');
    });

    it('returns providers with thinking support', () => {
      const providers = getProvidersWithCapability('thinking');
      const ids = providers.map((p) => p.providerId);
      expect(ids).toContain('openai');
      expect(ids).toContain('anthropic');
      expect(ids).toContain('google');
      expect(ids).toContain('deepseek');
    });
  });

  describe('getProvider', () => {
    it('returns entry for known provider', () => {
      const provider = getProvider('anthropic');
      expect(provider).toBeDefined();
      expect(provider?.displayName).toBe('Anthropic');
      expect(provider?.packageName).toBe('@ai-sdk/anthropic');
    });

    it('returns undefined for unknown provider', () => {
      expect(getProvider('nonexistent')).toBeUndefined();
    });
  });

  describe('validateProviderForTask', () => {
    it('validates OpenAI for all capabilities', () => {
      const result = validateProviderForTask('openai', ALL_CAPABILITIES);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('fails Anthropic for embeddings + imageGeneration', () => {
      const result = validateProviderForTask('anthropic', [
        'textGeneration',
        'toolCalling',
        'embeddings',
        'imageGeneration',
      ]);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('embeddings');
      expect(result.missing).toContain('imageGeneration');
    });

    it('passes Anthropic for core agent requirements', () => {
      const result = validateProviderForTask('anthropic', [
        'textGeneration',
        'streaming',
        'toolCalling',
        'structuredOutput',
      ]);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('fails DeepSeek for imageInput', () => {
      const result = validateProviderForTask('deepseek', ['textGeneration', 'imageInput']);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('imageInput');
    });

    it('returns all required as missing for unknown provider', () => {
      const required: ProviderCapability[] = ['textGeneration', 'streaming'];
      const result = validateProviderForTask('nonexistent', required);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(required);
    });

    it('passes with empty required list', () => {
      const result = validateProviderForTask('deepseek', []);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('provider quirks', () => {
    it('each provider has at least one quirk documented', () => {
      for (const provider of PROVIDER_REGISTRY) {
        expect(provider.quirks.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('OpenAI documents nullable structured output quirk', () => {
      const provider = getProvider('openai');
      expect(provider?.quirks.some((q) => q.includes('nullable'))).toBe(true);
    });

    it('Google documents z.union unsupported quirk', () => {
      const provider = getProvider('google');
      expect(provider?.quirks.some((q) => q.includes('z.union'))).toBe(true);
    });

    it('DeepSeek documents auto prompt caching', () => {
      const provider = getProvider('deepseek');
      expect(provider?.quirks.some((q) => q.includes('automatic'))).toBe(true);
    });
  });
});
