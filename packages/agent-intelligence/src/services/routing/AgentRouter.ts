/**
 * Agent Router
 *
 * Capability-aware routing service that maps tasks to the best available
 * AI provider based on required capabilities, provider tier, and
 * availability. Implements graceful degradation with fallback chains.
 */

import type { ProviderCapability } from '@thumbcode/config';
import { getProvider } from '@thumbcode/config';
import type { AgentRole, TaskAssignment } from '@thumbcode/types';
import type { AIProvider } from '../ai';
import { getDefaultModel } from '../ai';
import type {
  AgentCapabilityMap,
  AgentRouterConfig,
  FallbackEntry,
  RoutingDecision,
  RoutingRule,
} from './types';

/**
 * Default capability requirements for each agent role + task type combination.
 *
 * Architect needs structured output and thinking for design work.
 * Implementer needs code generation (text) and tool calling.
 * Reviewer needs analysis (text) and structured output for findings.
 * Tester needs code generation and tool calling for test execution.
 */
const DEFAULT_CAPABILITY_MAP: AgentCapabilityMap = {
  architect: {
    feature: ['textGeneration', 'structuredOutput', 'thinking'],
    bugfix: ['textGeneration', 'structuredOutput', 'thinking'],
    refactor: ['textGeneration', 'structuredOutput', 'thinking'],
    docs: ['textGeneration', 'structuredOutput'],
    review: ['textGeneration', 'structuredOutput'],
    test: ['textGeneration', 'structuredOutput'],
  },
  implementer: {
    feature: ['textGeneration', 'toolCalling', 'streaming'],
    bugfix: ['textGeneration', 'toolCalling', 'streaming'],
    refactor: ['textGeneration', 'toolCalling', 'streaming'],
    docs: ['textGeneration', 'streaming'],
    review: ['textGeneration', 'streaming'],
    test: ['textGeneration', 'toolCalling', 'streaming'],
  },
  reviewer: {
    feature: ['textGeneration', 'structuredOutput'],
    bugfix: ['textGeneration', 'structuredOutput'],
    refactor: ['textGeneration', 'structuredOutput'],
    docs: ['textGeneration'],
    review: ['textGeneration', 'structuredOutput'],
    test: ['textGeneration', 'structuredOutput'],
  },
  tester: {
    feature: ['textGeneration', 'toolCalling'],
    bugfix: ['textGeneration', 'toolCalling'],
    refactor: ['textGeneration', 'toolCalling'],
    docs: ['textGeneration'],
    review: ['textGeneration'],
    test: ['textGeneration', 'toolCalling', 'codeExecution'],
  },
};

/**
 * Default router configuration.
 */
const DEFAULT_CONFIG: AgentRouterConfig = {
  defaultProvider: 'anthropic',
  defaultModel: 'claude-sonnet-4-20250514',
  fallbackStrategy: 'next_best',
  minimumTier: 1,
};

export class AgentRouter {
  private readonly config: AgentRouterConfig;
  private readonly capabilityMap: AgentCapabilityMap;
  private readonly customRules: RoutingRule[] = [];

  constructor(config: Partial<AgentRouterConfig> = {}, capabilityMap?: AgentCapabilityMap) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.capabilityMap = capabilityMap ?? DEFAULT_CAPABILITY_MAP;
  }

  /**
   * Route a task to the best available provider for the given agent role.
   *
   * @param task - The task to route
   * @param availableProviders - Provider IDs the user has configured API keys for
   * @param agentRole - The agent role that will execute the task
   * @returns A routing decision with provider, model, confidence, and fallback chain
   */
  routeTask(
    task: TaskAssignment,
    availableProviders: AIProvider[],
    agentRole: AgentRole
  ): RoutingDecision {
    const requiredCapabilities = this.getRequiredCapabilities(agentRole, task.type);

    // Score each available provider
    const scored = this.scoreProviders(availableProviders, requiredCapabilities);

    // If no providers scored, return the default
    if (scored.length === 0) {
      return this.buildDefaultDecision(agentRole);
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    const fallbackChain: FallbackEntry[] = scored.slice(1).map((entry) => ({
      provider: entry.providerId,
      model: getDefaultModel(entry.providerId),
      confidence: entry.score,
    }));

    return {
      provider: best.providerId,
      model: getDefaultModel(best.providerId),
      agent: agentRole,
      confidence: best.score,
      fallbackChain,
    };
  }

  /**
   * Add a custom routing rule that overrides the default capability map.
   */
  addRule(rule: RoutingRule): void {
    this.customRules.push(rule);
  }

  /**
   * Get the required capabilities for a given agent role and task type.
   * Custom rules take precedence over the default capability map.
   */
  getRequiredCapabilities(
    agentRole: AgentRole,
    taskType: TaskAssignment['type']
  ): ProviderCapability[] {
    // Check custom rules first
    const customRule = this.customRules.find(
      (r) => r.agentRole === agentRole && r.taskType === taskType
    );
    if (customRule) {
      return customRule.requiredCapabilities;
    }

    // Fall back to default capability map
    return this.capabilityMap[agentRole]?.[taskType] ?? ['textGeneration'];
  }

  /**
   * Score providers based on how well they match required capabilities.
   * Score formula: (matched capabilities / total required) * tier weight
   */
  private scoreProviders(
    availableProviders: AIProvider[],
    requiredCapabilities: ProviderCapability[]
  ): ScoredProvider[] {
    const results: ScoredProvider[] = [];

    for (const providerId of availableProviders) {
      const entry = getProvider(providerId);
      if (!entry) continue;
      if (entry.tier < this.config.minimumTier) continue;

      const matchCount = requiredCapabilities.filter(
        (cap) => entry.capabilities[cap] !== 'none'
      ).length;

      const fullMatchCount = requiredCapabilities.filter(
        (cap) => entry.capabilities[cap] === 'full'
      ).length;

      if (requiredCapabilities.length === 0) {
        // No specific requirements — score by tier alone
        results.push({
          providerId,
          score: this.normalizedTier(entry.tier),
          matchCount: 0,
          fullMatchCount: 0,
        });
        continue;
      }

      // Base score: ratio of matched capabilities
      const matchRatio = matchCount / requiredCapabilities.length;
      // Bonus for full support vs partial
      const fullBonus = (fullMatchCount / requiredCapabilities.length) * 0.1;
      // Tier weight: higher tier providers get a small boost
      const tierBoost = this.normalizedTier(entry.tier) * 0.2;

      const score = Math.min(matchRatio + fullBonus + tierBoost, 1.0);

      results.push({ providerId, score, matchCount, fullMatchCount });
    }

    return results;
  }

  /**
   * Build a default routing decision when no providers match.
   */
  private buildDefaultDecision(agentRole: AgentRole): RoutingDecision {
    return {
      provider: this.config.defaultProvider,
      model: this.config.defaultModel,
      agent: agentRole,
      confidence: 0,
      fallbackChain: [],
    };
  }

  /**
   * Normalize tier to 0-1 range. Tier 4 = 1.0, Tier 1 = 0.25.
   */
  private normalizedTier(tier: number): number {
    return tier / 4;
  }
}

interface ScoredProvider {
  providerId: AIProvider;
  score: number;
  matchCount: number;
  fullMatchCount: number;
}
