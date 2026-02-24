/**
 * FrontendSkill and AgentSkill Tests
 *
 * Verifies:
 * - AgentSkill interface compliance
 * - FrontendSkill context tier content
 * - Each of the 6 frontend tools (including generate_variants)
 * - BaseAgent with skills attached
 * - System prompt includes skill extensions
 */

import type { Agent, AgentCapability, AgentRole } from '@/types';
import { type AgentContext, BaseAgent } from '../../agents/base-agent';
import { ImplementerAgent } from '../../agents/implementer-agent';
import type { AIClient, ToolDefinition } from '../../ai';
import { FrontendSkill } from '../FrontendSkill';
import type { AgentSkill } from '../types';

// --- Test helpers ---

function createMockAIClient(): AIClient {
  return {
    provider: 'anthropic',
    complete: vi.fn().mockResolvedValue({
      id: 'msg_test',
      content: [{ type: 'text', text: 'done' }],
      model: 'claude-3-5-sonnet-20241022',
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    }),
    completeStream: vi.fn().mockResolvedValue({
      id: 'msg_test',
      content: [{ type: 'text', text: 'done' }],
      model: 'claude-3-5-sonnet-20241022',
      stopReason: 'end_turn',
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    }),
  };
}

function createTestContext(): AgentContext {
  return {
    projectId: 'test-project',
    workspaceDir: '/workspace',
    currentBranch: 'main',
    availableFiles: ['src/index.ts'],
  };
}

/**
 * Concrete agent subclass for testing BaseAgent skill support
 */
class TestAgent extends BaseAgent {
  protected getSystemPrompt(_context: AgentContext): string {
    return 'You are a test agent.';
  }

  protected getCapabilities(): Agent['capabilities'] {
    return [
      {
        id: 'test',
        name: 'Test',
        description: 'Test capability',
        requiredCredentials: [],
        tools: ['test_tool'],
      } satisfies AgentCapability,
    ];
  }

  protected getTools(): ToolDefinition[] {
    return [
      {
        name: 'test_tool',
        description: 'A test tool',
        input_schema: {
          type: 'object',
          properties: { input: { type: 'string', description: 'Test input' } },
          required: ['input'],
        },
      },
    ];
  }

  protected async executeTool(
    name: string,
    _input: Record<string, unknown>,
    _context: AgentContext
  ): Promise<string> {
    return `executed:${name}`;
  }

  // Expose protected methods for testing
  public testGetSystemPromptWithSkills(context: AgentContext): string {
    return this.getSystemPromptWithSkills(context);
  }

  public testGetToolsWithSkills(): ToolDefinition[] {
    return this.getToolsWithSkills();
  }

  public testExecuteToolWithSkills(
    name: string,
    input: Record<string, unknown>,
    context: AgentContext
  ): Promise<string> {
    return this.executeToolWithSkills(name, input, context);
  }
}

// --- Tests ---

describe('AgentSkill interface compliance', () => {
  it('FrontendSkill implements all AgentSkill members', () => {
    const skill: AgentSkill = new FrontendSkill();

    expect(skill.id).toBe('frontend-skill');
    expect(skill.name).toBe('Frontend Design System');
    expect(typeof skill.description).toBe('string');
    expect(skill.description.length).toBeGreaterThan(0);

    expect(typeof skill.getSystemPromptExtension).toBe('function');
    expect(typeof skill.getTools).toBe('function');
    expect(typeof skill.executeTool).toBe('function');
    expect(typeof skill.getContextTier).toBe('function');
  });

  it('returns a non-empty system prompt extension', () => {
    const skill = new FrontendSkill();
    const ext = skill.getSystemPromptExtension();
    expect(ext.length).toBeGreaterThan(0);
    expect(ext).toContain('#FF7059'); // Coral color
    expect(ext).toContain('Fraunces'); // Display font
  });

  it('returns tool definitions with proper structure', () => {
    const skill = new FrontendSkill();
    const tools = skill.getTools();
    expect(tools.length).toBe(6);

    for (const tool of tools) {
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.parameters).toBe('object');
    }
  });
});

describe('FrontendSkill context tiers', () => {
  const skill = new FrontendSkill();

  it('Tier 1 includes essential brand constants', () => {
    const tier1 = skill.getContextTier(1);
    expect(tier1).toContain('#FF7059'); // Coral
    expect(tier1).toContain('#0D9488'); // Teal
    expect(tier1).toContain('#F5D563'); // Gold
    expect(tier1).toContain('#151820'); // Charcoal
    expect(tier1).toContain('Fraunces');
    expect(tier1).toContain('Cabin');
    expect(tier1).toContain('JetBrains Mono');
    expect(tier1).toContain('organic');
  });

  it('Tier 2 includes Tailwind config details', () => {
    const tier2 = skill.getContextTier(2);
    expect(tier2).toContain('coral:');
    expect(tier2).toContain('teal:');
    expect(tier2).toContain('gold:');
    expect(tier2).toContain('shadow-organic');
    expect(tier2).toContain('Font Families');
  });

  it('Tier 3 includes component catalog', () => {
    const tier3 = skill.getContextTier(3);
    expect(tier3).toContain('Component Catalog');
    expect(tier3).toContain('Button');
    expect(tier3).toContain('AgentCard');
    expect(tier3).toContain('ChatBubble');
  });

  it('Tier 4 includes component source access guidance', () => {
    const tier4 = skill.getContextTier(4);
    expect(tier4).toContain('Component Source Access');
    expect(tier4).toContain('list_components');
    expect(tier4).toContain('read_file');
  });
});

describe('FrontendSkill tools', () => {
  const skill = new FrontendSkill();

  describe('list_components', () => {
    it('returns component catalog', async () => {
      const result = await skill.executeTool('list_components', {});
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.components).toBeInstanceOf(Array);
      expect(data.components.length).toBeGreaterThan(0);
      expect(data.total).toBe(data.components.length);
    });

    it('uses custom directory', async () => {
      const result = await skill.executeTool('list_components', {
        directory: 'lib/components',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.directory).toBe('lib/components');
      expect(data.components[0].path).toContain('lib/components');
    });
  });

  describe('generate_component', () => {
    it('generates a brand-compliant component', async () => {
      const result = await skill.executeTool('generate_component', {
        name: 'StatusBadge',
        description: 'Displays agent status with colored indicator',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.componentName).toBe('StatusBadge');
      expect(data.fileName).toBe('status-badge.tsx');
      expect(data.targetDir).toBe('src/components/ui');
      expect(data.code).toContain('StatusBadge');
      expect(data.code).toContain('rounded-organic-card');
    });

    it('generates in correct variant directory', async () => {
      const result = await skill.executeTool('generate_component', {
        name: 'AgentPanel',
        description: 'Agent configuration panel',
        variant: 'agent',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.targetDir).toBe('src/components/agents');
    });

    it('fails without required params', async () => {
      const result = await skill.executeTool('generate_component', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('parses props JSON', async () => {
      const result = await skill.executeTool('generate_component', {
        name: 'TestCard',
        description: 'A test card',
        props: JSON.stringify({ title: 'string', count: 'number' }),
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.code).toContain('title: string');
      expect(data.code).toContain('count: number');
    });
  });

  describe('analyze_ui_screenshot', () => {
    it('returns structured analysis', async () => {
      const result = await skill.executeTool('analyze_ui_screenshot', {
        imageDescription: 'A dark-mode card with coral accent button',
        focus: 'colors',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.guidance).toBeDefined();
      expect(data.brandCompliance).toBeDefined();
      expect(data.brandCompliance.organicShapes).toBeDefined();
    });

    it('fails without imageDescription', async () => {
      const result = await skill.executeTool('analyze_ui_screenshot', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('compare_ui', () => {
    it('returns comparison checklist', async () => {
      const result = await skill.executeTool('compare_ui', {
        referenceDescription: 'A card with coral header and teal button',
        componentDescription: 'A card with red header and blue button',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.checklist).toBeInstanceOf(Array);
      expect(data.checklist.length).toBeGreaterThan(0);
    });

    it('fails without both descriptions', async () => {
      const result = await skill.executeTool('compare_ui', {
        referenceDescription: 'test',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('preview_component', () => {
    it('generates preview HTML with Tailwind CDN', async () => {
      const result = await skill.executeTool('preview_component', {
        componentCode: '<div class="bg-coral-500 p-4">Hello</div>',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.html).toContain('tailwindcss');
      expect(data.html).toContain('Fraunces');
      expect(data.html).toContain('#151820'); // Dark mode bg
      expect(data.darkMode).toBe(true);
    });

    it('supports light mode', async () => {
      const result = await skill.executeTool('preview_component', {
        componentCode: '<div>Light mode test</div>',
        darkMode: 'false',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.html).toContain('#F8FAFC'); // Light mode bg
      expect(data.darkMode).toBe(false);
    });

    it('fails without componentCode', async () => {
      const result = await skill.executeTool('preview_component', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('generate_variants', () => {
    it('generates 3 variants by default', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'StatusCard',
        description: 'Displays agent status with health indicator',
      });
      expect(result.success).toBe(true);

      const data = JSON.parse(result.output);
      expect(data.componentName).toBe('StatusCard');
      expect(data.variantCount).toBe(3);
      expect(data.variants).toHaveLength(3);

      // Each variant has required fields
      for (const variant of data.variants) {
        expect(variant.variantName).toBeDefined();
        expect(variant.variantKey).toBeDefined();
        expect(variant.label).toBeDefined();
        expect(variant.description).toBeDefined();
        expect(variant.code).toBeDefined();
        expect(variant.previewHtml).toBeDefined();
        expect(variant.fileName).toBeDefined();
      }
    });

    it('generates the correct variant keys', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'TestWidget',
        description: 'A test widget',
      });
      const data = JSON.parse(result.output);

      const keys = data.variants.map((v: { variantKey: string }) => v.variantKey);
      expect(keys).toContain('minimal');
      expect(keys).toContain('rich');
      expect(keys).toContain('compact');
    });

    it('respects custom variant count', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'Badge',
        description: 'Status badge',
        variantCount: '2',
      });
      const data = JSON.parse(result.output);
      expect(data.variantCount).toBe(2);
      expect(data.variants).toHaveLength(2);
    });

    it('caps variant count at 4', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'Card',
        description: 'A card',
        variantCount: '10',
      });
      const data = JSON.parse(result.output);
      expect(data.variantCount).toBe(4);
      expect(data.variants).toHaveLength(4);
    });

    it('uses specified style hints', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'Panel',
        description: 'A panel',
        styleHints: 'playful,compact',
      });
      const data = JSON.parse(result.output);

      const keys = data.variants.map((v: { variantKey: string }) => v.variantKey);
      expect(keys).toContain('playful');
      expect(keys).toContain('compact');
      expect(keys).not.toContain('minimal');
    });

    it('falls back to defaults for invalid style hints', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'Widget',
        description: 'A widget',
        styleHints: 'neon,brutalist,glass',
      });
      const data = JSON.parse(result.output);
      // Falls back to default first N presets
      expect(data.variants.length).toBeGreaterThan(0);
    });

    it('all variants are brand-compliant (organic border-radius)', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'InfoCard',
        description: 'Information card',
        variantCount: '4',
      });
      const data = JSON.parse(result.output);

      for (const variant of data.variants) {
        // All variants should have organic (asymmetric) border radius
        expect(variant.code).toContain('borderRadius:');
      }
    });

    it('includes shared props in all variants', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'UserCard',
        description: 'User profile card',
        props: JSON.stringify({ username: 'string', avatarUrl: 'string' }),
      });
      const data = JSON.parse(result.output);

      expect(data.sharedProps).toContain('username: string');
      expect(data.sharedProps).toContain('avatarUrl: string');

      for (const variant of data.variants) {
        expect(variant.code).toContain('username: string');
        expect(variant.code).toContain('avatarUrl: string');
      }
    });

    it('generates unique file names per variant', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'ActionButton',
        description: 'Action button',
      });
      const data = JSON.parse(result.output);

      const fileNames = data.variants.map((v: { fileName: string }) => v.fileName);
      const unique = new Set(fileNames);
      expect(unique.size).toBe(fileNames.length);

      // File names follow kebab-case-variant pattern
      for (const fileName of fileNames) {
        expect(fileName).toMatch(/^action-button-.+\.tsx$/);
      }
    });

    it('each variant has valid preview HTML', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'Card',
        description: 'A display card',
        variantCount: '2',
      });
      const data = JSON.parse(result.output);

      for (const variant of data.variants) {
        expect(variant.previewHtml).toContain('<!DOCTYPE html>');
        expect(variant.previewHtml).toContain('tailwindcss');
        expect(variant.previewHtml).toContain('Fraunces');
        expect(variant.previewHtml).toContain(variant.label);
      }
    });

    it('fails without required params', async () => {
      const result = await skill.executeTool('generate_variants', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('fails with only name', async () => {
      const result = await skill.executeTool('generate_variants', { name: 'Test' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('minimal variant has no shadow', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'MinTest',
        description: 'Test',
        styleHints: 'minimal',
      });
      const data = JSON.parse(result.output);
      const minimalVariant = data.variants[0];
      expect(minimalVariant.code).toContain("boxShadow: '0 0px 0px transparent'");
    });

    it('playful variant has larger rotation', async () => {
      const result = await skill.executeTool('generate_variants', {
        name: 'PlayTest',
        description: 'Test',
        styleHints: 'playful',
      });
      const data = JSON.parse(result.output);
      const playfulVariant = data.variants[0];
      expect(playfulVariant.code).toContain("rotate(-1deg)");
    });
  });

  describe('unknown tool', () => {
    it('returns error for unknown tool name', async () => {
      const result = await skill.executeTool('nonexistent_tool', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown tool');
    });
  });
});

describe('BaseAgent with skills', () => {
  const mockClient = createMockAIClient();
  const context = createTestContext();

  it('addSkill adds skill to the agent', () => {
    const agent = new TestAgent({
      id: 'test-1',
      role: 'implementer' as AgentRole,
      name: 'Test',
      aiClient: mockClient,
    });

    expect(agent.getSkills()).toHaveLength(0);

    agent.addSkill(new FrontendSkill());
    expect(agent.getSkills()).toHaveLength(1);
    expect(agent.getSkills()[0].id).toBe('frontend-skill');
  });

  it('system prompt includes skill extensions', () => {
    const agent = new TestAgent({
      id: 'test-2',
      role: 'implementer' as AgentRole,
      name: 'Test',
      aiClient: mockClient,
    });

    const basePrompt = agent.testGetSystemPromptWithSkills(context);
    expect(basePrompt).toBe('You are a test agent.');

    agent.addSkill(new FrontendSkill());
    const withSkill = agent.testGetSystemPromptWithSkills(context);
    expect(withSkill).toContain('You are a test agent.');
    expect(withSkill).toContain('#FF7059'); // Coral from skill extension
    expect(withSkill).toContain('Fraunces');
  });

  it('getToolsWithSkills includes skill tools', () => {
    const agent = new TestAgent({
      id: 'test-3',
      role: 'implementer' as AgentRole,
      name: 'Test',
      aiClient: mockClient,
    });

    const baseTools = agent.testGetToolsWithSkills();
    expect(baseTools).toHaveLength(1);
    expect(baseTools[0].name).toBe('test_tool');

    agent.addSkill(new FrontendSkill());
    const withSkillTools = agent.testGetToolsWithSkills();
    expect(withSkillTools.length).toBe(7); // 1 base + 6 skill tools

    const toolNames = withSkillTools.map((t) => t.name);
    expect(toolNames).toContain('test_tool');
    expect(toolNames).toContain('list_components');
    expect(toolNames).toContain('generate_component');
    expect(toolNames).toContain('analyze_ui_screenshot');
    expect(toolNames).toContain('compare_ui');
    expect(toolNames).toContain('preview_component');
    expect(toolNames).toContain('generate_variants');
  });

  it('skill tools have proper ToolDefinition shape', () => {
    const agent = new TestAgent({
      id: 'test-4',
      role: 'implementer' as AgentRole,
      name: 'Test',
      aiClient: mockClient,
    });
    agent.addSkill(new FrontendSkill());

    const tools = agent.testGetToolsWithSkills();
    for (const tool of tools) {
      expect(tool.input_schema.type).toBe('object');
      expect(typeof tool.input_schema.properties).toBe('object');
    }
  });

  it('routes skill tool calls to the skill', async () => {
    const agent = new TestAgent({
      id: 'test-5',
      role: 'implementer' as AgentRole,
      name: 'Test',
      aiClient: mockClient,
    });
    agent.addSkill(new FrontendSkill());

    // Skill tool should be handled by FrontendSkill
    const skillResult = await agent.testExecuteToolWithSkills('list_components', {}, context);
    const parsed = JSON.parse(skillResult);
    expect(parsed.components).toBeDefined();

    // Base tool should still be handled by the agent
    const baseResult = await agent.testExecuteToolWithSkills(
      'test_tool',
      { input: 'hello' },
      context
    );
    expect(baseResult).toBe('executed:test_tool');
  });

  it('getInfo includes skill tools in config', () => {
    const agent = new TestAgent({
      id: 'test-6',
      role: 'implementer' as AgentRole,
      name: 'Test',
      aiClient: mockClient,
    });
    agent.addSkill(new FrontendSkill());

    const info = agent.getInfo();
    expect(info.config.tools).toContain('list_components');
    expect(info.config.tools).toContain('generate_component');
    expect(info.config.tools).toContain('test_tool');
  });
});

describe('ImplementerAgent has FrontendSkill by default', () => {
  it('ships with FrontendSkill attached', () => {
    const agent = new ImplementerAgent({
      id: 'impl-1',
      role: 'implementer' as AgentRole,
      name: 'Implementer',
      aiClient: createMockAIClient(),
    });

    const skills = agent.getSkills();
    expect(skills).toHaveLength(1);
    expect(skills[0].id).toBe('frontend-skill');
  });

  it('includes frontend tools in getInfo', () => {
    const agent = new ImplementerAgent({
      id: 'impl-2',
      role: 'implementer' as AgentRole,
      name: 'Implementer',
      aiClient: createMockAIClient(),
    });

    const info = agent.getInfo();
    expect(info.config.tools).toContain('list_components');
    expect(info.config.tools).toContain('generate_component');
    expect(info.config.tools).toContain('generate_variants');
    expect(info.config.tools).toContain('preview_component');
    // Also has base implementer tools
    expect(info.config.tools).toContain('read_file');
    expect(info.config.tools).toContain('write_file');
  });
});
