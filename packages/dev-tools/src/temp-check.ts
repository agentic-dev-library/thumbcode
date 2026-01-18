
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator';

const coral500 = '#FF7059';
const neutral50 = '#F8FAFC';

const ratio = colorContrastRatioCalculator(coral500, neutral50);

console.log(`Contrast ratio between coral-500 and neutral-50: ${ratio}`);
