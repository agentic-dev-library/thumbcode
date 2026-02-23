import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator';
import tokens from '../../../design-system/tokens.json';

const { colors } = tokens;

const allColors: { name: string; hex: string }[] = [];

Object.entries(colors).forEach(([name, color]) => {
  const colorEntry = color as Record<string, unknown>;
  if (colorEntry.values) {
    Object.entries(colorEntry.values as Record<string, { hex: string }>).forEach(
      ([shade, value]) => {
        allColors.push({ name: `${name}-${shade}`, hex: value.hex });
      }
    );
  } else {
    allColors.push({ name, hex: (colorEntry as { hex: string }).hex });
  }
});

console.log('Checking color contrast ratios...');

let failingCombinations = 0;

for (let i = 0; i < allColors.length; i++) {
  for (let j = i + 1; j < allColors.length; j++) {
    const colorA = allColors[i];
    const colorB = allColors[j];

    const ratio = colorContrastRatioCalculator(colorA.hex, colorB.hex);

    if (ratio < 4.5) {
      console.log(
        `FAIL: ${colorA.name} (${colorA.hex}) and ${colorB.name} (${colorB.hex}) - Ratio: ${ratio.toFixed(
          2
        )}`
      );
      failingCombinations++;
    }
  }
}

console.log(`\nFound ${failingCombinations} failing combinations.`);

if (failingCombinations > 0) {
  process.exit(1);
}
