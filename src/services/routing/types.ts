/**
 * Agent Routing Types
 *
 * Types for capability-aware agent routing and graceful degradation.
 */

import type { ProviderCapability } from '@/config';
import type { AgentRole, TaskType } from '@/types';
import type { AIProvider } from '../ai';

/**
 * A routing decision for a single agent assignment.
 */
export interface RoutingDecision {
  /** Selected provider ID */
  provider: AIProvider;
  /** Selected model for the provider */
  model: string;
  /** Agent role this decision applies to */
  agent: AgentRole;
  /** Confidence score 0-1 indicating match quality */
  confidence: number;
  /** Ordered list of fallback providers if the primary fails */
  fallbackChain: FallbackEntry[];
}

/**
 * An entry in the fallback chain.
 */
export interface FallbackEntry {
  provider: AIProvider;
  model: string;
  confidence: number;
}

/**
 * A rule mapping task types to required capabilities per agent role.
 */
export interface RoutingRule {
  /** Task type this rule applies to */
  taskType: TaskType;
  /** Agent role this rule applies to */
  agentRole: AgentRole;
  /** Capabilities required for this task/role combo */
  requiredCapabilities: ProviderCapability[];
  /** Capabilities that improve results but aren't mandatory */
  preferredCapabilities: ProviderCapability[];
}

/**
 * A single capability requirement with support level.
 */
export interface CapabilityRequirement {
  capability: ProviderCapability;
  /** Whether this capability is mandatory or just preferred */
  required: boolean;
}

/**
 * Strategy for handling fallback when preferred providers are unavailable.
 */
export type FallbackStrategy = 'next_best' | 'default_only' | 'fail';

/**
 * Maps agent roles to their required capabilities for different task contexts.
 */
export type AgentCapabilityMap = Record<AgentRole, Record<TaskType, ProviderCapability[]>>;

/**
 * Configuration for the AgentRouter.
 */
export interface AgentRouterConfig {
  /** Default provider to use when no better match is found */
  defaultProvider: AIProvider;
  /** Default model for the default provider */
  defaultModel: string;
  /** How to handle unavailable providers */
  fallbackStrategy: FallbackStrategy;
  /** Minimum tier required for routing (1-4) */
  minimumTier: number;
}
