/**
 * Variant Generation Tests
 *
 * Tests for the universal variant generation mode in the AgentOrchestrator.
 * Covers same_provider and multi_provider modes, variant selection,
 * and error handling.
 */

import type { AgentContext } from '../../agents/base-agent';
import { AgentOrchestrator } from '../orchestrator';

// Mock the Vercel AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'Variant response from AI',
    response: { id: 'msg_variant_123' },
    finishReason: 'stop',
    usage: { inputTokens: 150, outputTokens: 200, totalTokens: 350 },
    toolCalls: [],
  }),
  streamText: vi.fn().mockImplementation(() => ({
    textStream: {
      [Symbol.asyncIterator]: () => {
        let done = false;
        return {
          async next() {
            if (!done) {
              done = true;
              return { value: 'Done', done: false };
            }
            return { value: undefined, done: true };
          },
        };
      },
    },
    response: Promise.resolve({ id: 'msg_variant_123' }),
    usage: Promise.resolve({ inputTokens: 100, outputTokens: 50, totalTokens: 150 }),
    finishReason: Promise.resolve('stop'),
    toolCalls: Promise.resolve([]),
  })),
}));

// Mock all AI SDK provider packages
const mockModelFactory = () => ({ modelId: 'mock-model', provider: 'mock' });
vi.mock('@ai-sdk/anthropic', () => ({ createAnthropic: () => mockModelFactory }));
vi.mock('@ai-sdk/openai', () => ({ createOpenAI: () => mockModelFactory }));
vi.mock('@ai-sdk/google', () => ({ createGoogleGenerativeAI: () => mockModelFactory }));
vi.mock('@ai-sdk/azure', () => ({ createAzure: () => mockModelFactory }));
vi.mock('@ai-sdk/xai', () => ({ createXai: () => mockModelFactory }));
vi.mock('@ai-sdk/amazon-bedrock', () => ({ createAmazonBedrock: () => mockModelFactory }));
vi.mock('@ai-sdk/mistral', () => ({ createMistral: () => mockModelFactory }));
vi.mock('@ai-sdk/cohere', () => ({ createCohere: () => mockModelFactory }));
vi.mock('@ai-sdk/groq', () => ({ createGroq: () => mockModelFactory }));
vi.mock('@ai-sdk/deepseek', () => ({ createDeepSeek: () => mockModelFactory }));

describe('Variant Generation', () => {
  const mockContext: AgentContext = {
    projectId: 'test-project',
    workspaceDir: '/tmp/workspace',
    currentBranch: 'main',
    availableFiles: ['src/index.ts'],
  };

  let orchestrator: AgentOrchestrator;

  beforeEach(async () => {
    orchestrator = new AgentOrchestrator(
      {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        maxConcurrentAgents: 4,
        autoAssign: true,
        enableParallelExecution: false,
        projectContext: mockContext,
      },
      'sk-ant-test'
    );
    await orchestrator.initialize();
  });

  describe('generateVariants (same_provider)', () => {
    it('should generate the requested number of variants', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'How should I structure a React app?',
        variantCount: 3,
        diversityMode: 'same_provider',
      });

      expect(result.variants).toHaveLength(3);
      expect(result.requestId).toContain('variant-');
    });

    it('should assign unique IDs to each variant', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'How to implement auth?',
        variantCount: 3,
        diversityMode: 'same_provider',
      });

      const ids = result.variants.map((v) => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should assign different names and descriptions to variants', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Design a database schema',
        variantCount: 3,
        diversityMode: 'same_provider',
      });

      const names = result.variants.map((v) => v.name);
      expect(names[0]).toContain('Minimal');
      expect(names[1]).toContain('Comprehensive');
      expect(names[2]).toContain('Creative');
    });

    it('should use the configured provider for all variants in same_provider mode', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test prompt',
        variantCount: 2,
        diversityMode: 'same_provider',
      });

      for (const variant of result.variants) {
        expect(variant.provider).toBe('anthropic');
      }
    });

    it('should include token usage and model info', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test prompt',
        variantCount: 2,
        diversityMode: 'same_provider',
      });

      for (const variant of result.variants) {
        expect(variant.tokensUsed).toBeGreaterThan(0);
        expect(variant.model).toBeTruthy();
        expect(variant.generatedAt).toBeTruthy();
      }
    });

    it('should include estimated cost', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test prompt',
        variantCount: 2,
        diversityMode: 'same_provider',
      });

      for (const variant of result.variants) {
        expect(variant.estimatedCost).toBeDefined();
        expect(typeof variant.estimatedCost).toBe('number');
      }
    });

    it('should limit variant count to available prompt variations', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test prompt',
        variantCount: 10, // More than available prompts (4)
        diversityMode: 'same_provider',
      });

      expect(result.variants.length).toBeLessThanOrEqual(4);
    });

    it('should store variant results for later retrieval', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test prompt',
        variantCount: 2,
        diversityMode: 'same_provider',
      });

      const retrieved = orchestrator.getVariantResult(result.requestId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.requestId).toBe(result.requestId);
      expect(retrieved?.variants).toHaveLength(2);
    });
  });

  describe('generateVariants (multi_provider)', () => {
    it('should distribute variants across available providers', async () => {
      const result = await orchestrator.generateVariants(
        {
          prompt: 'Test multi-provider',
          variantCount: 2,
          diversityMode: 'multi_provider',
        },
        [
          { provider: 'anthropic', apiKey: 'sk-ant-test' },
          { provider: 'openai', apiKey: 'sk-openai-test' },
        ]
      );

      expect(result.variants).toHaveLength(2);
      const providers = result.variants.map((v) => v.provider);
      expect(providers).toContain('anthropic');
      expect(providers).toContain('openai');
    });

    it('should fall back to same_provider if only one provider available', async () => {
      const result = await orchestrator.generateVariants(
        {
          prompt: 'Test fallback',
          variantCount: 2,
          diversityMode: 'multi_provider',
        },
        [{ provider: 'anthropic', apiKey: 'sk-ant-test' }]
      );

      expect(result.variants).toHaveLength(2);
      // With only one provider, should use the config provider
      for (const variant of result.variants) {
        expect(variant.provider).toBe('anthropic');
      }
    });

    it('should fall back to same_provider if no availableProviders given', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test no providers',
        variantCount: 2,
        diversityMode: 'multi_provider',
      });

      expect(result.variants).toHaveLength(2);
      for (const variant of result.variants) {
        expect(variant.provider).toBe('anthropic');
      }
    });
  });

  describe('selectVariant', () => {
    it('should mark a variant as selected', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test',
        variantCount: 2,
        diversityMode: 'same_provider',
      });

      orchestrator.selectVariant(result.requestId, result.variants[0].id);

      const updated = orchestrator.getVariantResult(result.requestId);
      expect(updated?.selectedVariantId).toBe(result.variants[0].id);
    });

    it('should not throw for non-existent result ID', () => {
      expect(() => orchestrator.selectVariant('nonexistent', 'variant-1')).not.toThrow();
    });

    it('should update selection when called again', async () => {
      const result = await orchestrator.generateVariants({
        prompt: 'Test',
        variantCount: 2,
        diversityMode: 'same_provider',
      });

      orchestrator.selectVariant(result.requestId, result.variants[0].id);
      orchestrator.selectVariant(result.requestId, result.variants[1].id);

      const updated = orchestrator.getVariantResult(result.requestId);
      expect(updated?.selectedVariantId).toBe(result.variants[1].id);
    });
  });

  describe('getVariantResult', () => {
    it('should return undefined for non-existent result', () => {
      expect(orchestrator.getVariantResult('nonexistent')).toBeUndefined();
    });
  });
});
