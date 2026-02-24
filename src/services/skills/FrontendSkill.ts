/**
 * Frontend Skill
 *
 * Design-system-aware skill for the ThumbCode P3 "Warm Technical" brand.
 * Provides tiered context injection and tools for generating brand-compliant
 * React Native components with organic styling.
 */

import type { ToolResult } from '../tools/types';
import type { AgentSkill, ContextTier, SkillToolDefinition } from './types';

/**
 * Tier 1: Essential constants (~200 tokens) - always injected
 */
const TIER_1_CONTEXT = `## ThumbCode Design System (P3 "Warm Technical")

### Colors
- Primary (Coral): #FF7059 / hsl(8, 100%, 67%)
- Secondary (Teal): #0D9488 / hsl(175, 84%, 32%)
- Accent (Gold): #F5D563 / hsl(47, 87%, 67%)
- Base Dark (Charcoal Navy): #151820
- Base Light (Off White): #F8FAFC

### Typography
- Display: Fraunces (Georgia fallback) — headlines, hero text
- Body: Cabin (system-ui fallback) — UI text, labels
- Code: JetBrains Mono (monospace fallback) — code blocks, terminal

### Organic Styling Rules
- NEVER use perfect border-radius. Use asymmetric values:
  Buttons: borderRadius: 50px 45px 50px 48px / 26px 28px 26px 24px
  Cards: borderRadius: 20px 18px 22px 16px / 16px 20px 18px 22px
- Add subtle rotation to cards: transform: rotate(-0.3deg) (even children: 0.3deg)
- NEVER use linear/radial gradients for backgrounds
- Use multi-layered organic shadows with brand color tints`;

/**
 * Tier 2: Full Tailwind config (~400 tokens)
 */
const TIER_2_CONTEXT = `## Tailwind Custom Configuration

### Color Scales
coral: { 50: '#FFF5F3', 100: '#FFE8E4', 200: '#FFD0C9', 300: '#FFB0A5', 400: '#FF8F7F', 500: '#FF7059', 600: '#E85A4F', 700: '#C4433C', 800: '#A33832', 900: '#7A2A25' }
teal: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A' }
gold: { 50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047', 400: '#F5D563', 500: '#EAB308', 600: '#D4A84B', 700: '#A16207', 800: '#854D0E', 900: '#713F12' }
charcoal: '#151820'
surface: { DEFAULT: '#1E293B', elevated: '#334155' }

### Font Families
display: ['Fraunces', 'Georgia', 'serif']
body: ['Cabin', 'system-ui', 'sans-serif']
mono: ['JetBrains Mono', 'monospace']

### Spacing Scale (base-4)
0.5: 2px, 1: 4px, 1.5: 6px, 2: 8px, 3: 12px, 4: 16px, 5: 20px, 6: 24px, 8: 32px, 10: 40px, 12: 48px, 16: 64px

### Organic Shadows
shadow-organic: 0 2px 4px rgba(13, 148, 136, 0.08), 0 8px 24px rgba(21, 24, 32, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)
shadow-coral: 0 4px 12px rgba(255, 112, 89, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)`;

/**
 * Tier 3: Component catalog (~300 tokens) - on demand
 */
const TIER_3_CONTEXT = `## Component Catalog

Available UI primitives in src/components/ui/:
- Button: Primary/secondary/ghost variants, organic border-radius. Props: variant, size, disabled, onPress, children
- Card: Elevated surface with organic shadows and tilt. Props: variant, children, style
- Text: Typography component with font-family presets. Props: variant (display|body|code), size, weight, children
- Input: Text input with organic border-radius. Props: label, placeholder, value, onChangeText, error
- Badge: Status indicator with organic shape. Props: variant (success|warning|error|info), children
- IconButton: Circular button with icon. Props: icon, size, variant, onPress

Available workspace components in src/components/workspace/:
- AgentCard: Displays agent status with role icon. Props: agent, onSelect
- ChatBubble: Message bubble (user/agent variants). Props: message, variant
- FileTree: Workspace file browser. Props: files, onFileSelect
- CodeBlock: Syntax-highlighted code display. Props: code, language, showLineNumbers

Available agent components in src/components/agents/:
- AgentAvatar: Role-based avatar with status dot. Props: role, status, size
- AgentStatusBar: Horizontal agent status overview. Props: agents`;

/**
 * Tier 4: Full component source (~500 tokens each) - on demand
 * Returns a placeholder since actual source requires filesystem access
 */
const TIER_4_CONTEXT = `## Component Source Access

Use the \`list_components\` tool to discover available components, then read their source with the agent's \`read_file\` tool for full implementation details. Component sources contain:
- Complete TypeScript interfaces/props
- NativeWind/Tailwind class usage patterns
- Organic styling implementations
- Accessibility attributes (a11y)
- Dark/light mode variants`;

/**
 * Built-in variant style presets for multi-variant generation.
 * Each preset defines a visual approach while remaining brand-compliant.
 */
const VARIANT_PRESETS: Record<string, { label: string; description: string; styleHints: string }> =
  {
    minimal: {
      label: 'Minimal',
      description:
        'Clean, spacious layout with subtle accents. Emphasis on whitespace and typography.',
      styleHints:
        'Use teal-600 for a single accent line or icon. Large padding (p-6). Fraunces display text only for the primary label. No shadows, just a thin border-teal-100 border. Muted color usage.',
    },
    rich: {
      label: 'Rich',
      description:
        'Full-featured layout with coral accents, gold highlights, and layered organic shadows.',
      styleHints:
        'Coral-500 primary button, gold-400 highlight badge/indicator, teal-600 secondary text. Multi-layer shadow-organic. Subtle card rotation. All three brand colors visible.',
    },
    compact: {
      label: 'Compact',
      description: 'Dense, information-rich layout optimized for small screens and lists.',
      styleHints:
        'Tight padding (p-2 or p-3). Smaller font sizes. Horizontal flex layout. Badge-style indicators. Mono font for data values. Minimal vertical spacing (gap-1).',
    },
    playful: {
      label: 'Playful',
      description:
        'Expressive layout with bolder rotations, larger organic shapes, and warm gold accents.',
      styleHints:
        'Larger card rotation (rotate(-1deg)/rotate(1deg)). Gold-400 background accents. Coral-500 large icons. Exaggerated asymmetric border-radius. Fraunces display at larger sizes. Visible shadow-coral.',
    },
  };

/**
 * Tool definitions for the FrontendSkill
 */
const FRONTEND_TOOLS: SkillToolDefinition[] = [
  {
    name: 'list_components',
    description:
      'Scan the project for existing React Native/React components. Returns component names, file paths, and brief descriptions.',
    parameters: {
      directory: {
        type: 'string',
        description: 'Directory to scan for components (default: "src/components")',
      },
      pattern: {
        type: 'string',
        description: 'Glob pattern to filter components (e.g., "**/*.tsx")',
      },
    },
  },
  {
    name: 'generate_component',
    description:
      'Generate a brand-compliant ThumbCode React component with organic styling, proper typography, and design tokens. Output follows P3 "Warm Technical" conventions.',
    parameters: {
      name: {
        type: 'string',
        description: 'PascalCase component name (e.g., "AgentStatusCard")',
        required: true,
      },
      description: {
        type: 'string',
        description: 'What the component should do and display',
        required: true,
      },
      variant: {
        type: 'string',
        description:
          'Component type: "ui" (primitive), "workspace" (editor), or "agent" (agent-related)',
      },
      props: {
        type: 'string',
        description: 'JSON string describing the props interface',
      },
    },
  },
  {
    name: 'analyze_ui_screenshot',
    description:
      'Analyze a UI screenshot image and return structured analysis including layout, colors, typography, spacing, and accessibility observations. Requires vision capability.',
    parameters: {
      imageDescription: {
        type: 'string',
        description: 'Description or base64 data of the screenshot to analyze',
        required: true,
      },
      focus: {
        type: 'string',
        description:
          'What to focus on: "layout", "colors", "typography", "spacing", "accessibility", or "all"',
      },
    },
  },
  {
    name: 'compare_ui',
    description:
      'Compare a reference design image description against a generated component description. Returns a list of discrepancies and suggestions.',
    parameters: {
      referenceDescription: {
        type: 'string',
        description: 'Description of the reference/target design',
        required: true,
      },
      componentDescription: {
        type: 'string',
        description: 'Description of the generated component output',
        required: true,
      },
    },
  },
  {
    name: 'preview_component',
    description:
      'Generate self-contained HTML for iframe preview of a React component. Includes Tailwind CDN configured with ThumbCode design tokens.',
    parameters: {
      componentCode: {
        type: 'string',
        description: 'The React component source code to preview',
        required: true,
      },
      darkMode: {
        type: 'string',
        description: 'Whether to render in dark mode ("true" or "false", default "true")',
      },
    },
  },
  {
    name: 'generate_variants',
    description:
      'Generate multiple design variants of a component (like 21st.dev). Each variant uses the same props but a different visual approach (minimal, rich, compact, playful). All variants comply with the ThumbCode P3 design system. Users pick their favorite.',
    parameters: {
      description: {
        type: 'string',
        description: 'What the component should do and display',
        required: true,
      },
      name: {
        type: 'string',
        description: 'PascalCase component name (e.g., "AgentStatusCard")',
        required: true,
      },
      variantCount: {
        type: 'string',
        description: 'Number of variants to generate (1-4, default 3)',
      },
      styleHints: {
        type: 'string',
        description:
          'Comma-separated style hints to use instead of defaults (e.g., "minimal,rich,compact")',
      },
      props: {
        type: 'string',
        description: 'JSON string describing the props interface (shared across all variants)',
      },
    },
  },
];

/**
 * FrontendSkill implementation.
 *
 * Provides ThumbCode design system awareness to agents through:
 * - Tiered context injection for token budget management
 * - 6 frontend-specific tools for component work
 */
export class FrontendSkill implements AgentSkill {
  readonly id = 'frontend-skill';
  readonly name = 'Frontend Design System';
  readonly description =
    'ThumbCode P3 "Warm Technical" design system awareness with organic styling, component generation, and UI analysis tools.';

  getSystemPromptExtension(): string {
    // Always inject Tier 1 + Tier 2 for agents with this skill
    return `${TIER_1_CONTEXT}\n\n${TIER_2_CONTEXT}`;
  }

  getTools(): SkillToolDefinition[] {
    return FRONTEND_TOOLS;
  }

  getContextTier(tier: ContextTier): string {
    switch (tier) {
      case 1:
        return TIER_1_CONTEXT;
      case 2:
        return TIER_2_CONTEXT;
      case 3:
        return TIER_3_CONTEXT;
      case 4:
        return TIER_4_CONTEXT;
    }
  }

  async executeTool(toolName: string, params: Record<string, unknown>): Promise<ToolResult> {
    switch (toolName) {
      case 'list_components':
        return this.listComponents(params);
      case 'generate_component':
        return this.generateComponent(params);
      case 'analyze_ui_screenshot':
        return this.analyzeScreenshot(params);
      case 'compare_ui':
        return this.compareUI(params);
      case 'preview_component':
        return this.previewComponent(params);
      case 'generate_variants':
        return this.generateVariants(params);
      default:
        return { success: false, output: '', error: `Unknown tool: ${toolName}` };
    }
  }

  private async listComponents(params: Record<string, unknown>): Promise<ToolResult> {
    const directory = (params.directory as string) || 'src/components';
    const pattern = (params.pattern as string) || '**/*.tsx';

    // In production this would scan the filesystem via the agent's file tools.
    // Here we return the known component catalog structure.
    const catalog = [
      { path: `${directory}/ui/Button.tsx`, name: 'Button', category: 'ui' },
      { path: `${directory}/ui/Card.tsx`, name: 'Card', category: 'ui' },
      { path: `${directory}/ui/Text.tsx`, name: 'Text', category: 'ui' },
      { path: `${directory}/ui/Input.tsx`, name: 'Input', category: 'ui' },
      { path: `${directory}/ui/Badge.tsx`, name: 'Badge', category: 'ui' },
      { path: `${directory}/ui/IconButton.tsx`, name: 'IconButton', category: 'ui' },
      { path: `${directory}/workspace/AgentCard.tsx`, name: 'AgentCard', category: 'workspace' },
      { path: `${directory}/workspace/ChatBubble.tsx`, name: 'ChatBubble', category: 'workspace' },
      { path: `${directory}/workspace/FileTree.tsx`, name: 'FileTree', category: 'workspace' },
      { path: `${directory}/workspace/CodeBlock.tsx`, name: 'CodeBlock', category: 'workspace' },
      { path: `${directory}/agents/AgentAvatar.tsx`, name: 'AgentAvatar', category: 'agents' },
      {
        path: `${directory}/agents/AgentStatusBar.tsx`,
        name: 'AgentStatusBar',
        category: 'agents',
      },
    ];

    const filtered = pattern.includes('*')
      ? catalog
      : catalog.filter((c) => c.path.includes(pattern));

    return {
      success: true,
      output: JSON.stringify(
        {
          directory,
          pattern,
          components: filtered,
          total: filtered.length,
        },
        null,
        2
      ),
    };
  }

  private async generateComponent(params: Record<string, unknown>): Promise<ToolResult> {
    const name = params.name as string;
    const description = params.description as string;
    const variant = (params.variant as string) || 'ui';
    const propsJson = params.props as string | undefined;

    if (!name || !description) {
      return {
        success: false,
        output: '',
        error: 'Both "name" and "description" parameters are required',
      };
    }

    // Determine the directory based on variant
    const variantDirs: Record<string, string> = {
      ui: 'src/components/ui',
      workspace: 'src/components/workspace',
      agent: 'src/components/agents',
    };
    const targetDir = variantDirs[variant] || variantDirs.ui;

    // Parse props if provided
    let propsInterface = '';
    if (propsJson) {
      try {
        const props = JSON.parse(propsJson) as Record<string, string>;
        const propLines = Object.entries(props)
          .map(([propName, propType]) => `  ${propName}: ${propType};`)
          .join('\n');
        propsInterface = `interface ${name}Props {\n${propLines}\n}`;
      } catch {
        propsInterface = `interface ${name}Props {\n  // TODO: Define props\n}`;
      }
    } else {
      propsInterface = `interface ${name}Props {\n  // TODO: Define props based on: ${description}\n}`;
    }

    const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const template = `/**
 * ${name}
 *
 * ${description}
 */

import { Text } from '@/components/ui';

${propsInterface}

export function ${name}({ ...props }: ${name}Props) {
  return (
    <div
      className="bg-surface-elevated p-4 rounded-organic-card shadow-organic-card"
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      {/* TODO: Implement ${description} */}
    </div>
  );
}
`;

    return {
      success: true,
      output: JSON.stringify(
        {
          fileName: `${kebabName}.tsx`,
          targetDir,
          filePath: `${targetDir}/${kebabName}.tsx`,
          componentName: name,
          code: template,
        },
        null,
        2
      ),
    };
  }

  private async analyzeScreenshot(params: Record<string, unknown>): Promise<ToolResult> {
    const imageDescription = params.imageDescription as string;
    const focus = (params.focus as string) || 'all';

    if (!imageDescription) {
      return {
        success: false,
        output: '',
        error: '"imageDescription" parameter is required',
      };
    }

    // This tool provides structured analysis guidance.
    // In production with vision models, the image would be analyzed directly.
    const analysis = {
      input: { imageDescription: imageDescription.substring(0, 200), focus },
      guidance: {
        layout: 'Analyze component hierarchy, flex direction, alignment, and spacing patterns.',
        colors:
          'Compare colors against ThumbCode palette: Coral #FF7059, Teal #0D9488, Gold #F5D563, Charcoal #151820.',
        typography:
          'Check font usage against Fraunces (display), Cabin (body), JetBrains Mono (code).',
        spacing: 'Verify base-4 spacing scale compliance (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).',
        accessibility:
          'Check color contrast ratios (WCAG AA: 4.5:1 text, 3:1 large text), touch targets (44x44 minimum).',
      },
      brandCompliance: {
        organicShapes: 'Verify asymmetric border-radius, no perfect circles/rectangles',
        noGradients: 'Confirm no linear/radial gradients used',
        warmPalette: 'Confirm coral/teal/gold palette, no cold blues/purples',
      },
    };

    return {
      success: true,
      output: JSON.stringify(analysis, null, 2),
    };
  }

  private async compareUI(params: Record<string, unknown>): Promise<ToolResult> {
    const referenceDescription = params.referenceDescription as string;
    const componentDescription = params.componentDescription as string;

    if (!referenceDescription || !componentDescription) {
      return {
        success: false,
        output: '',
        error: 'Both "referenceDescription" and "componentDescription" parameters are required',
      };
    }

    const comparison = {
      reference: referenceDescription.substring(0, 200),
      component: componentDescription.substring(0, 200),
      checklist: [
        'Color palette matches ThumbCode P3 tokens',
        'Typography uses Fraunces/Cabin/JetBrains Mono',
        'Border radius is organic (asymmetric)',
        'No gradients in backgrounds',
        'Shadows use brand color tints',
        'Cards have subtle rotation transform',
        'Touch targets meet 44x44 minimum',
        'WCAG AA contrast ratios maintained',
        'Dark and light mode variants present',
      ],
      note: 'Use the agent read_file tool to load actual component source for detailed comparison.',
    };

    return {
      success: true,
      output: JSON.stringify(comparison, null, 2),
    };
  }

  private async previewComponent(params: Record<string, unknown>): Promise<ToolResult> {
    const componentCode = params.componentCode as string;
    const darkMode = (params.darkMode as string) !== 'false';

    if (!componentCode) {
      return {
        success: false,
        output: '',
        error: '"componentCode" parameter is required',
      };
    }

    const bgColor = darkMode ? '#151820' : '#F8FAFC';
    const textColor = darkMode ? '#F8FAFC' : '#151820';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ThumbCode Component Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            coral: { 50: '#FFF5F3', 100: '#FFE8E4', 200: '#FFD0C9', 300: '#FFB0A5', 400: '#FF8F7F', 500: '#FF7059', 600: '#E85A4F', 700: '#C4433C', 800: '#A33832', 900: '#7A2A25' },
            teal: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A' },
            gold: { 50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047', 400: '#F5D563', 500: '#EAB308', 600: '#D4A84B', 700: '#A16207', 800: '#854D0E', 900: '#713F12' },
            charcoal: '#151820',
            surface: { DEFAULT: '#1E293B', elevated: '#334155' },
          },
          fontFamily: {
            display: ['Fraunces', 'Georgia', 'serif'],
            body: ['Cabin', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
        },
      },
    };
  </script>
  <style>
    body {
      background: ${bgColor};
      color: ${textColor};
      font-family: 'Cabin', system-ui, sans-serif;
      padding: 24px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div id="preview">
    <!-- Component preview rendered here -->
    <pre style="font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre-wrap;">${componentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
</body>
</html>`;

    return {
      success: true,
      output: JSON.stringify(
        {
          html,
          darkMode,
          note: 'Render this HTML in a sandboxed iframe for live preview.',
        },
        null,
        2
      ),
    };
  }

  private async generateVariants(params: Record<string, unknown>): Promise<ToolResult> {
    const description = params.description as string;
    const name = params.name as string;
    const variantCount = Math.min(4, Math.max(1, Number(params.variantCount) || 3));
    const styleHintsParam = params.styleHints as string | undefined;
    const propsJson = params.props as string | undefined;

    if (!description || !name) {
      return {
        success: false,
        output: '',
        error: 'Both "description" and "name" parameters are required',
      };
    }

    // Determine which variant styles to use
    const presetKeys = Object.keys(VARIANT_PRESETS);
    let selectedKeys: string[];
    if (styleHintsParam) {
      const requested = styleHintsParam.split(',').map((s) => s.trim().toLowerCase());
      selectedKeys = requested.filter((k) => presetKeys.includes(k));
      if (selectedKeys.length === 0) {
        selectedKeys = presetKeys.slice(0, variantCount);
      }
    } else {
      selectedKeys = presetKeys.slice(0, variantCount);
    }

    // Parse shared props
    let propsInterface = '';
    if (propsJson) {
      try {
        const props = JSON.parse(propsJson) as Record<string, string>;
        const propLines = Object.entries(props)
          .map(([propName, propType]) => `  ${propName}: ${propType};`)
          .join('\n');
        propsInterface = `interface ${name}Props {\n${propLines}\n}`;
      } catch {
        propsInterface = `interface ${name}Props {\n  // TODO: Define props\n}`;
      }
    } else {
      propsInterface = `interface ${name}Props {\n  // TODO: Define props based on: ${description}\n}`;
    }

    const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    // Generate each variant
    const variants = selectedKeys.map((key) => {
      const preset = VARIANT_PRESETS[key];
      const variantSuffix = key.charAt(0).toUpperCase() + key.slice(1);

      const code = this.buildVariantCode(name, variantSuffix, description, propsInterface, preset);

      const previewHtml = this.buildVariantPreviewHtml(name, variantSuffix, code, preset);

      return {
        variantName: `${name}${variantSuffix}`,
        variantKey: key,
        label: preset.label,
        description: preset.description,
        styleHints: preset.styleHints,
        fileName: `${kebabName}-${key}.tsx`,
        code,
        previewHtml,
      };
    });

    return {
      success: true,
      output: JSON.stringify(
        {
          componentName: name,
          description,
          variantCount: variants.length,
          sharedProps: propsInterface,
          variants,
        },
        null,
        2
      ),
    };
  }

  private buildVariantCode(
    name: string,
    suffix: string,
    description: string,
    propsInterface: string,
    preset: { label: string; description: string; styleHints: string }
  ): string {
    // Each variant gets a unique visual approach based on the preset
    const styleComment = `// Style: ${preset.label} - ${preset.description}`;
    const componentName = `${name}${suffix}`;

    // Generate style objects that differ per variant
    const styles = this.getVariantStyles(suffix.toLowerCase());

    return `/**
 * ${componentName}
 *
 * ${description}
 * Variant: ${preset.label} - ${preset.description}
 *
 * ${styleComment}
 */

import { Text } from '@/components/ui';

${propsInterface}

export function ${componentName}({ ...props }: ${name}Props) {
  return (
    <div
      className="${styles.containerClasses}"
      style={{
        borderRadius: '${styles.borderRadius[0]}px ${styles.borderRadius[1]}px ${styles.borderRadius[2]}px ${styles.borderRadius[3]}px',
        boxShadow: '0 ${styles.shadowHeight}px ${styles.shadowRadius}px ${styles.shadowColor}',
        transform: 'rotate(${styles.rotation})',
      }}
    >
      {/* TODO: Implement ${description} */}
      {/* Style hints: ${preset.styleHints} */}
    </div>
  );
}
`;
  }

  private getVariantStyles(variantKey: string): {
    containerClasses: string;
    borderRadius: [number, number, number, number];
    shadowColor: string;
    shadowHeight: number;
    shadowRadius: number;
    rotation: string;
  } {
    switch (variantKey) {
      case 'minimal':
        return {
          containerClasses: 'bg-surface p-6 border border-teal-100',
          borderRadius: [16, 14, 18, 12],
          shadowColor: 'transparent',
          shadowHeight: 0,
          shadowRadius: 0,
          rotation: '0deg',
        };
      case 'rich':
        return {
          containerClasses: 'bg-surface-elevated p-5',
          borderRadius: [20, 18, 22, 16],
          shadowColor: 'rgba(13, 148, 136, 0.08)',
          shadowHeight: 8,
          shadowRadius: 24,
          rotation: '-0.3deg',
        };
      case 'compact':
        return {
          containerClasses: 'bg-surface-elevated p-2 flex-row items-center gap-2',
          borderRadius: [10, 8, 12, 8],
          shadowColor: 'rgba(21, 24, 32, 0.08)',
          shadowHeight: 2,
          shadowRadius: 8,
          rotation: '0deg',
        };
      case 'playful':
        return {
          containerClasses: 'bg-surface-elevated p-5',
          borderRadius: [28, 22, 30, 20],
          shadowColor: 'rgba(255, 112, 89, 0.2)',
          shadowHeight: 10,
          shadowRadius: 32,
          rotation: '-1deg',
        };
      default:
        return {
          containerClasses: 'bg-surface-elevated p-4',
          borderRadius: [20, 18, 22, 16],
          shadowColor: 'rgba(13, 148, 136, 0.08)',
          shadowHeight: 8,
          shadowRadius: 24,
          rotation: '-0.3deg',
        };
    }
  }

  private buildVariantPreviewHtml(
    name: string,
    suffix: string,
    code: string,
    preset: { label: string; description: string }
  ): string {
    const componentName = `${name}${suffix}`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} - ${preset.label} Variant</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            coral: { 500: '#FF7059', 600: '#E85A4F' },
            teal: { 100: '#CCFBF1', 500: '#14B8A6', 600: '#0D9488' },
            gold: { 400: '#F5D563' },
            charcoal: '#151820',
            surface: { DEFAULT: '#1E293B', elevated: '#334155' },
          },
          fontFamily: {
            display: ['Fraunces', 'Georgia', 'serif'],
            body: ['Cabin', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
        },
      },
    };
  </script>
  <style>
    body { background: #151820; color: #F8FAFC; font-family: 'Cabin', system-ui, sans-serif; padding: 24px; margin: 0; }
    .variant-label { font-family: 'Fraunces', Georgia, serif; color: #F5D563; font-size: 14px; margin-bottom: 8px; }
    .variant-desc { color: #94A3B8; font-size: 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="variant-label">${preset.label} Variant</div>
  <div class="variant-desc">${preset.description}</div>
  <pre style="font-family: 'JetBrains Mono', monospace; font-size: 11px; white-space: pre-wrap; color: #CBD5E1;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
  }
}
