#!/usr/bin/env tsx

/**
 * Generate Design Token Artifacts
 *
 * Converts design-system/tokens.json to:
 * - CSS custom properties (variables.css)
 * - Tailwind color configuration (tailwind-colors.js)
 *
 * Run: pnpm run generate:tokens
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths relative to workspace root
const ROOT_DIR = join(__dirname, '../../../');
const TOKENS_PATH = join(ROOT_DIR, 'design-system/tokens.json');
const OUTPUT_DIR = join(ROOT_DIR, 'design-system/generated');

interface ColorValue {
  hex: string;
  description?: string;
}

interface ColorData {
  description?: string;
  values?: Record<string, ColorValue>;
}

interface Tokens {
  colors: Record<string, string | ColorData>;
  spacing: {
    description: string;
    values: Record<string, string>;
  };
  typography: {
    fontSizes: Record<string, { value: string; description?: string }>;
  };
  borderRadius: {
    organic: { value: string };
    organicCard: { value: string };
  };
  shadows: {
    organic: { value: string };
    organicCoral: { value: string };
  };
}

/**
 * Generate CSS custom properties from design tokens
 */
function generateCSSVariables(tokens: Tokens): void {
  let css = '/**\n * Design Tokens - CSS Custom Properties\n * Auto-generated from tokens.json\n * DO NOT EDIT MANUALLY\n */\n\n:root {\n';

  // Colors
  for (const [colorName, colorData] of Object.entries(tokens.colors)) {
    if (typeof colorData === 'string') {
      css += `  --color-${colorName}: ${colorData};\n`;
    } else if (colorData.values) {
      for (const [shade, value] of Object.entries(colorData.values)) {
        css += `  --color-${colorName}-${shade}: ${value.hex};\n`;
      }
    }
  }

  css += '\n  /* Spacing */\n';
  for (const [key, value] of Object.entries(tokens.spacing.values)) {
    css += `  --spacing-${key}: ${value};\n`;
  }

  css += '\n  /* Typography */\n';
  for (const [key, value] of Object.entries(tokens.typography.fontSizes)) {
    css += `  --font-size-${key}: ${value.value};\n`;
  }

  css += '\n  /* Border Radius */\n';
  css += `  --radius-organic: ${tokens.borderRadius.organic.value};\n`;
  css += `  --radius-organic-card: ${tokens.borderRadius.organicCard.value};\n`;

  css += '\n  /* Shadows */\n';
  css += `  --shadow-organic: ${tokens.shadows.organic.value};\n`;
  css += `  --shadow-organic-coral: ${tokens.shadows.organicCoral.value};\n`;

  css += '}\n';

  writeFileSync(join(OUTPUT_DIR, 'variables.css'), css);
  console.log('✓ Generated variables.css');
}

/**
 * Generate Tailwind-compatible colors module from design tokens
 */
function generateTailwindColors(tokens: Tokens): void {
  const colors: Record<string, string | Record<string, string>> = {};

  for (const [colorName, colorData] of Object.entries(tokens.colors)) {
    if (typeof colorData === 'string') {
      colors[colorName] = colorData;
    } else if (colorData.values) {
      colors[colorName] = {};
      for (const [shade, value] of Object.entries(colorData.values)) {
        (colors[colorName] as Record<string, string>)[shade] = value.hex;
      }
    }
  }

  const output = `/**
 * Tailwind Colors Configuration
 * Auto-generated from tokens.json
 * DO NOT EDIT MANUALLY
 */

export const colors = ${JSON.stringify(colors, null, 2)};
`;

  writeFileSync(join(OUTPUT_DIR, 'tailwind-colors.js'), output);
  console.log('✓ Generated tailwind-colors.js');
}

/**
 * Main generation function
 */
async function generateAll(): Promise<void> {
  console.log('\n🎨 ThumbCode Design Token Generator\n');
  console.log('━'.repeat(60));

  // Check if tokens file exists
  if (!existsSync(TOKENS_PATH)) {
    console.error(`❌ Tokens file not found: ${TOKENS_PATH}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  } else {
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
  }

  try {
    // Load tokens
    const tokensContent = readFileSync(TOKENS_PATH, 'utf8');
    const tokens: Tokens = JSON.parse(tokensContent);

    console.log('Generating design token artifacts...\n');

    // Generate all artifacts
    generateCSSVariables(tokens);
    generateTailwindColors(tokens);

    console.log('\n' + '━'.repeat(60));
    console.log('\n✅ All artifacts generated successfully!\n');
  } catch (error) {
    console.error('\n❌ Token generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAll().catch((error) => {
    console.error('Token generation error:', error);
    process.exit(1);
  });
}

export { generateAll, generateCSSVariables, generateTailwindColors };
