/**
 * AgentRouter Tests
 *
 * Tests for capability-aware agent routing with graceful degradation.
 */

import type { TaskAssignment } from '@thumbcode/types';
import { AgentRouter } from '../AgentRouter';
import type { AgentRouterConfig, RoutingRule } from '../types';

// Mock AI SDKs to prevent import errors
vi.mock('@anthropic-ai/sdk', () => ({ default: vi.fn() }));
vi.mock('openai', () => ({ default: vi.fn() }));

function createMockTask(overrides: Partial<TaskAssignment> = {}): TaskAssignment {
  return {
    id: 'task-1',
    type: 'feature',
    title: 'Build a feature',
    description: 'Implement the feature',
    assignee: '',
    dependsOn: [],
    status: 'pending',
    priority: 'medium',
    acceptanceCriteria: ['Must work'],
    references: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('AgentRouter', () => {
  let router: AgentRouter;

  beforeEach(() => {
    router = new AgentRouter();
  });

  describe('routeTask', () => {
    it('should route a feature task to the best provider for an architect', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(task, ['anthropic', 'openai'], 'architect');

      expect(decision.agent).toBe('architect');
      expect(decision.provider).toBeDefined();
      expect(decision.model).toBeDefined();
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it('should route a feature task to the best provider for an implementer', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(task, ['anthropic', 'openai'], 'implementer');

      expect(decision.agent).toBe('implementer');
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it('should route a review task to the best provider for a reviewer', () => {
      const task = createMockTask({ type: 'review' });
      const decision = router.routeTask(task, ['anthropic', 'openai', 'google'], 'reviewer');

      expect(decision.agent).toBe('reviewer');
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it('should route a test task to the best provider for a tester', () => {
      const task = createMockTask({ type: 'test' });
      const decision = router.routeTask(task, ['anthropic', 'openai'], 'tester');

      expect(decision.agent).toBe('tester');
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it('should route a bugfix task for an implementer', () => {
      const task = createMockTask({ type: 'bugfix' });
      const decision = router.routeTask(task, ['openai', 'google'], 'implementer');

      expect(decision.agent).toBe('implementer');
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it('should route a docs task for an architect', () => {
      const task = createMockTask({ type: 'docs' });
      const decision = router.routeTask(task, ['anthropic'], 'architect');

      expect(decision.agent).toBe('architect');
      expect(decision.provider).toBe('anthropic');
    });

    it('should route a refactor task for an implementer', () => {
      const task = createMockTask({ type: 'refactor' });
      const decision = router.routeTask(task, ['anthropic', 'mistral'], 'implementer');

      expect(decision.agent).toBe('implementer');
      expect(decision.confidence).toBeGreaterThan(0);
    });
  });

  describe('fallback chain', () => {
    it('should include fallback providers in the decision', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(task, ['anthropic', 'openai', 'google'], 'architect');

      // With 3 providers, there should be fallbacks
      expect(decision.fallbackChain.length).toBeGreaterThanOrEqual(1);
    });

    it('should order fallback chain by confidence descending', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(
        task,
        ['anthropic', 'openai', 'google', 'mistral'],
        'implementer'
      );

      for (let i = 1; i < decision.fallbackChain.length; i++) {
        expect(decision.fallbackChain[i - 1].confidence).toBeGreaterThanOrEqual(
          decision.fallbackChain[i].confidence
        );
      }
    });

    it('should have a primary provider with higher confidence than fallbacks', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(task, ['anthropic', 'openai', 'groq'], 'architect');

      if (decision.fallbackChain.length > 0) {
        expect(decision.confidence).toBeGreaterThanOrEqual(decision.fallbackChain[0].confidence);
      }
    });
  });

  describe('graceful degradation', () => {
    it('should return a default decision when no providers are available', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(task, [], 'architect');

      expect(decision.provider).toBe('anthropic'); // default
      expect(decision.confidence).toBe(0);
      expect(decision.fallbackChain).toEqual([]);
    });

    it('should return a default decision when no providers match the registry', () => {
      const task = createMockTask({ type: 'feature' });
      // Use a valid type but one filtered by minimumTier
      const highTierRouter = new AgentRouter({ minimumTier: 5 });
      const decision = highTierRouter.routeTask(task, ['groq'], 'architect');

      expect(decision.provider).toBe('anthropic');
      expect(decision.confidence).toBe(0);
    });

    it('should use custom default provider when configured', () => {
      const customRouter = new AgentRouter({
        defaultProvider: 'openai',
        defaultModel: 'gpt-4o',
      });
      const task = createMockTask({ type: 'feature' });
      const decision = customRouter.routeTask(task, [], 'architect');

      expect(decision.provider).toBe('openai');
      expect(decision.model).toBe('gpt-4o');
    });

    it('should still route with a single available provider', () => {
      const task = createMockTask({ type: 'feature' });
      const decision = router.routeTask(task, ['groq'], 'implementer');

      expect(decision.provider).toBe('groq');
      expect(decision.confidence).toBeGreaterThan(0);
      expect(decision.fallbackChain).toEqual([]);
    });
  });

  describe('capability matching', () => {
    it('should prefer tier 4 providers over lower tiers for feature tasks', () => {
      const task = createMockTask({ type: 'feature' });
      // anthropic (tier 4) vs mistral (tier 2)
      const decision = router.routeTask(task, ['mistral', 'anthropic'], 'architect');

      // Anthropic should win because it has full thinking + structuredOutput + higher tier
      expect(decision.provider).toBe('anthropic');
    });

    it('should select providers that support required capabilities', () => {
      const task = createMockTask({ type: 'test' });
      // For tester + test: needs textGeneration, toolCalling, codeExecution
      // anthropic has all three at full, cohere has no codeExecution
      const decision = router.routeTask(task, ['cohere', 'anthropic'], 'tester');

      expect(decision.provider).toBe('anthropic');
    });

    it('should return getRequiredCapabilities for architect + feature', () => {
      const caps = router.getRequiredCapabilities('architect', 'feature');

      expect(caps).toContain('textGeneration');
      expect(caps).toContain('structuredOutput');
      expect(caps).toContain('thinking');
    });

    it('should return getRequiredCapabilities for implementer + feature', () => {
      const caps = router.getRequiredCapabilities('implementer', 'feature');

      expect(caps).toContain('textGeneration');
      expect(caps).toContain('toolCalling');
      expect(caps).toContain('streaming');
    });

    it('should return getRequiredCapabilities for tester + test', () => {
      const caps = router.getRequiredCapabilities('tester', 'test');

      expect(caps).toContain('textGeneration');
      expect(caps).toContain('toolCalling');
      expect(caps).toContain('codeExecution');
    });

    it('should filter out providers below minimum tier', () => {
      const highTierRouter = new AgentRouter({ minimumTier: 3 });
      const task = createMockTask({ type: 'feature' });
      // groq is tier 2, should be filtered out
      const decision = highTierRouter.routeTask(task, ['groq'], 'architect');

      // groq filtered, falls back to default
      expect(decision.confidence).toBe(0);
    });
  });

  describe('custom routing rules', () => {
    it('should use custom rules when they match', () => {
      const rule: RoutingRule = {
        taskType: 'feature',
        agentRole: 'architect',
        requiredCapabilities: ['textGeneration', 'imageInput'],
        preferredCapabilities: ['pdfInput'],
      };
      router.addRule(rule);

      const caps = router.getRequiredCapabilities('architect', 'feature');
      expect(caps).toContain('imageInput');
      expect(caps).not.toContain('thinking'); // overridden
    });

    it('should fall back to default map when no custom rule matches', () => {
      const rule: RoutingRule = {
        taskType: 'docs',
        agentRole: 'reviewer',
        requiredCapabilities: ['textGeneration', 'pdfInput'],
        preferredCapabilities: [],
      };
      router.addRule(rule);

      // This rule is for docs/reviewer, so feature/architect should use defaults
      const caps = router.getRequiredCapabilities('architect', 'feature');
      expect(caps).toContain('thinking');
    });
  });
});
