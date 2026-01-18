/**
 * Color Contrast Checker for ThumbCode Accessibility
 *
 * Checks actual foreground/background color pairs used in the application
 * against WCAG 2.1 contrast requirements.
 *
 * WCAG Requirements:
 * - AA Normal Text: 4.5:1 minimum
 * - AA Large Text: 3:1 minimum (18pt+ or 14pt+ bold)
 * - AAA Normal Text: 7:1 minimum
 * - AAA Large Text: 4.5:1 minimum
 */

import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator';
import tokens from '../../../design-system/tokens.json';

interface ColorPair {
  foreground: string;
  background: string;
  description: string;
  isLargeText?: boolean;
}

// Extract colors from tokens
function getColor(path: string): string {
  const parts = path.split('-');
  const colorName = parts[0];
  const shade = parts[1];

  const colorDef = (tokens.colors as Record<string, unknown>)[colorName] as {
    hex?: string;
    values?: Record<string, { hex: string }>;
  };

  if (!colorDef) {
    throw new Error(`Color not found: ${path}`);
  }

  if (shade && colorDef.values) {
    return colorDef.values[shade]?.hex;
  }
  return colorDef.hex || '';
}

// Define actual color pairs used in the application
const colorPairs: ColorPair[] = [
  // Primary text on dark backgrounds
  {
    foreground: getColor('neutral-50'),
    background: getColor('charcoal'),
    description: 'White text on dark background',
  },
  {
    foreground: getColor('neutral-400'),
    background: getColor('charcoal'),
    description: 'Muted text on dark background',
  },

  // Coral (primary) usage
  {
    foreground: getColor('coral-500'),
    background: getColor('charcoal'),
    description: 'Coral text on dark background',
  },
  {
    foreground: getColor('neutral-50'),
    background: getColor('coral-500'),
    description: 'White text on coral button',
  },

  // Teal (secondary) usage
  {
    foreground: getColor('teal-500'),
    background: getColor('charcoal'),
    description: 'Teal text on dark background',
  },
  {
    foreground: getColor('neutral-50'),
    background: getColor('teal-600'),
    description: 'White text on teal button',
  },

  // Gold (accent) usage
  {
    foreground: getColor('gold-400'),
    background: getColor('charcoal'),
    description: 'Gold text on dark background',
    isLargeText: true, // Typically used for larger display text
  },

  // Surface colors
  {
    foreground: getColor('neutral-50'),
    background: getColor('neutral-800'),
    description: 'White text on surface',
  },
  {
    foreground: getColor('neutral-400'),
    background: getColor('neutral-800'),
    description: 'Muted text on surface',
  },

  // Error state
  {
    foreground: getColor('neutral-50'),
    background: getColor('coral-600'),
    description: 'White text on error background',
  },

  // Success state
  {
    foreground: getColor('neutral-50'),
    background: getColor('teal-600'),
    description: 'White text on success background',
  },
];

console.log('ThumbCode Color Contrast Audit');
console.log('==============================\n');

let passCount = 0;
let failCount = 0;
const results: { pass: boolean; description: string; ratio: number; required: number }[] = [];

for (const pair of colorPairs) {
  const ratio = colorContrastRatioCalculator(pair.foreground, pair.background);
  const required = pair.isLargeText ? 3.0 : 4.5;
  const pass = ratio >= required;

  if (pass) {
    passCount++;
  } else {
    failCount++;
  }

  results.push({
    pass,
    description: pair.description,
    ratio,
    required,
  });
}

// Print results grouped by status
console.log('PASSING:');
for (const result of results.filter((r) => r.pass)) {
  console.log(
    `  ✓ ${result.description}: ${result.ratio.toFixed(2)}:1 (required: ${result.required}:1)`
  );
}

if (failCount > 0) {
  console.log('\nFAILING:');
  for (const result of results.filter((r) => !r.pass)) {
    console.log(
      `  ✗ ${result.description}: ${result.ratio.toFixed(2)}:1 (required: ${result.required}:1)`
    );
  }
}

console.log(`\n==============================`);
console.log(`Total: ${passCount} passing, ${failCount} failing`);

if (failCount > 0) {
  console.log('\nSome color combinations do not meet WCAG AA requirements.');
  console.log('Consider adjusting colors or using larger/bolder text.');
  process.exit(1);
} else {
  console.log('\nAll checked color combinations meet WCAG AA requirements.');
}
