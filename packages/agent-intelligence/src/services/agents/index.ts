/**
 * Agent Services
 *
 * Specialized AI agents for ThumbCode.
 */

export * from './base-agent';
export * from './architect-agent';
export * from './implementer-agent';
export * from './reviewer-agent';
export * from './tester-agent';

import type { AgentRole } from '@thumbcode/types';
import type { AIClient } from '../ai';
import { ArchitectAgent } from './architect-agent';
import { BaseAgent } from './base-agent';
import { ImplementerAgent } from './implementer-agent';
import { ReviewerAgent } from './reviewer-agent';
import { TesterAgent } from './tester-agent';

/**
 * Create an agent by role
 */
export function createAgent(
  role: AgentRole,
  config: {
    id: string;
    name: string;
    aiClient: AIClient;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): BaseAgent {
  const baseConfig = {
    ...config,
    role,
  };

  switch (role) {
    case 'architect':
      return new ArchitectAgent(baseConfig);
    case 'implementer':
      return new ImplementerAgent(baseConfig);
    case 'reviewer':
      return new ReviewerAgent(baseConfig);
    case 'tester':
      return new TesterAgent(baseConfig);
    default:
      throw new Error(`Unknown agent role: ${role}`);
  }
}

/**
 * Default agent configurations
 */
export const DEFAULT_AGENT_CONFIGS: Record<
  AgentRole,
  {
    name: string;
    temperature: number;
    maxTokens: number;
  }
> = {
  architect: {
    name: 'Architect',
    temperature: 0.7,
    maxTokens: 4096,
  },
  implementer: {
    name: 'Implementer',
    temperature: 0.3,
    maxTokens: 8192,
  },
  reviewer: {
    name: 'Reviewer',
    temperature: 0.5,
    maxTokens: 4096,
  },
  tester: {
    name: 'Tester',
    temperature: 0.3,
    maxTokens: 4096,
  },
};
