#!/usr/bin/env node
/**
 * Generate design token artifacts from tokens.json
 * 
 * Run: node scripts/generate-tokens.js
 */

const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '../design-system/tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

const OUTPUT_DIR = path.join(__dirname, '../design-system/generated');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate CSS Custom Properties
 */
function generateCSSVariables() {
  let css = '/**\n * Design Tokens - CSS Custom Properties\n * Auto-generated from tokens.json\n * DO NOT EDIT MANUALLY\n */\n\n:root {\n';
  
  // Colors
  Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
    if (typeof colorData === 'string') {
      css += `  --color-${colorName}: ${colorData};\n`;
    } else if (colorData.values) {
      Object.entries(colorData.values).forEach(([shade, value]) => {
        css += `  --color-${colorName}-${shade}: ${value.hex};\n`;
      });
    }
  });
  
  css += '\n  /* Spacing */\n';
  Object.entries(tokens.spacing.values).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });
  
  css += '\n  /* Typography */\n';
  Object.entries(tokens.typography.fontSizes).forEach(([key, value]) => {
    css += `  --font-size-${key}: ${value.value};\n`;
  });
  
  css += '\n  /* Border Radius */\n';
  css += `  --radius-organic: ${tokens.borderRadius.organic.value};\n`;
  css += `  --radius-organic-card: ${tokens.borderRadius.organicCard.value};\n`;
  
  css += '\n  /* Shadows */\n';
  css += `  --shadow-organic: ${tokens.shadows.organic.value};\n`;
  css += `  --shadow-organic-coral: ${tokens.shadows.organicCoral.value};\n`;
  
  css += '}\n';
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'variables.css'), css);
  console.log('✓ Generated variables.css');
}

/**
 * Generate Tailwind Colors Config
 */
function generateTailwindColors() {
  const colors = {};
  
  Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
    if (typeof colorData === 'string') {
      colors[colorName] = colorData;
    } else if (colorData.values) {
      colors[colorName] = {};
      Object.entries(colorData.values).forEach(([shade, value]) => {
        colors[colorName][shade] = value.hex;
      });
    }
  });
  
  const output = `/**
 * Tailwind Colors Configuration
 * Auto-generated from tokens.json
 * DO NOT EDIT MANUALLY
 */

export const colors = ${JSON.stringify(colors, null, 2)};
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'tailwind-colors.js'), output);
  console.log('✓ Generated tailwind-colors.js');
}

// Run all generators
console.log('Generating design token artifacts...\n');
generateCSSVariables();
generateTailwindColors();
console.log('\n✅ All artifacts generated successfully!');
