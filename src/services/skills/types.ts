/**
 * Agent Skill Types
 *
 * Interfaces for the composable skill system that extends agent capabilities.
 * Skills inject domain-specific context, tools, and behavior into agents.
 */

import type { ToolResult } from '../tools/types';

/**
 * Parameter definition for a skill tool
 */
export interface SkillToolParameter {
  type: string;
  description: string;
  required?: boolean;
}

/**
 * Tool definition provided by a skill
 */
export interface SkillToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, SkillToolParameter>;
}

/**
 * Context injection tier level
 *
 * - Tier 1: Always injected (~200 tokens) - essential constants
 * - Tier 2: Usually injected (~400 tokens) - expanded config
 * - Tier 3: On demand (~300 tokens) - catalog/index
 * - Tier 4: On demand (~500 each) - full source/details
 */
export type ContextTier = 1 | 2 | 3 | 4;

/**
 * Composable skill interface for extending agent capabilities.
 *
 * Skills provide:
 * - System prompt extensions with domain context
 * - Additional tools for specialized operations
 * - Tiered context injection for token budget management
 */
export interface AgentSkill {
  /** Unique identifier for the skill */
  id: string;

  /** Human-readable skill name */
  name: string;

  /** Description of what this skill provides */
  description: string;

  /** Extend the agent's system prompt with skill-specific context */
  getSystemPromptExtension(): string;

  /** Additional tools this skill provides */
  getTools(): SkillToolDefinition[];

  /** Execute a skill-specific tool */
  executeTool(toolName: string, params: Record<string, unknown>): Promise<ToolResult>;

  /** Context injection tiers (for token budget management) */
  getContextTier(tier: ContextTier): string;
}
