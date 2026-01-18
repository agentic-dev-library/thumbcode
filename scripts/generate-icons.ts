#!/usr/bin/env tsx

/**
 * Generate Expo App Icons from SVGs
 *
 * Converts SVG files to PNG with transparent backgrounds at exact sizes needed by Expo.
 *
 * Run: pnpm run generate:icons
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

// Icon specifications for Expo
const ICON_SPECS = {
  // App icon (used by Expo for all platforms if specific ones aren't provided)
  'icon.png': {
    source: 'public/assets/icons/app/ThumbCode_AppIcon_1024.svg',
    size: 1024,
    description: 'Main app icon',
  },

  // Splash screen (can be same as icon, or custom)
  'splash.png': {
    source: 'public/assets/icons/app/ThumbCode_AppIcon_1024.svg',
    size: 2048,
    description: 'Splash screen image',
  },

  // Android adaptive icon
  'adaptive-icon.png': {
    source: 'public/assets/icons/app/ThumbCode_AppIcon_1024.svg',
    size: 1024,
    description: 'Android adaptive icon (safe zone: 66% circle)',
  },

  // Favicon (for web/PWA)
  'favicon.png': {
    source: 'public/assets/icons/app/favicon-organic.svg',
    size: 48,
    description: 'Web favicon',
  },
} as const;

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = join(ROOT_DIR, 'assets');

async function generateIcon(
  filename: string,
  spec: { source: string; size: number; description: string }
): Promise<void> {
  const sourcePath = join(ROOT_DIR, spec.source);
  const outputPath = join(OUTPUT_DIR, filename);

  // Check if source exists
  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  Source not found: ${spec.source}`);
    console.warn(`   Skipping ${filename}`);
    return;
  }

  try {
    // Read SVG
    const svgBuffer = readFileSync(sourcePath);

    // Convert SVG to PNG with sharp
    await sharp(svgBuffer, {
      density: 300, // High DPI for quality
    })
      .resize(spec.size, spec.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .png({
        compressionLevel: 9, // Maximum compression
        adaptiveFiltering: true,
      })
      .toFile(outputPath);

    console.log(`✅ Generated ${filename} (${spec.size}x${spec.size}px) - ${spec.description}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${filename}:`, error);
    throw error;
  }
}

async function generateAll(): Promise<void> {
  console.log('\n🎨 ThumbCode Icon Generator\n');
  console.log('━'.repeat(60));

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  } else {
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
  }

  // Generate all icons
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  for (const [filename, spec] of Object.entries(ICON_SPECS)) {
    try {
      await generateIcon(filename, spec);
      successCount++;
    } catch (error) {
      failCount++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '━'.repeat(60));
  console.log(`\n✨ Icon generation complete in ${duration}s`);
  console.log(`   Success: ${successCount}/${Object.keys(ICON_SPECS).length}`);

  if (failCount > 0) {
    console.log(`   Failed: ${failCount}`);
    process.exit(1);
  }

  console.log('\n💡 Tip: These icons are optimized for Expo and have transparent backgrounds.');
  console.log('   Check app.json to ensure paths match:\n');
  console.log('   "icon": "./assets/icon.png"');
  console.log('   "splash": { "image": "./assets/splash.png" }');
  console.log('   "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png" } }');
  console.log('   "web": { "favicon": "./assets/favicon.png" }\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAll().catch((error) => {
    console.error('\n❌ Icon generation failed:', error);
    process.exit(1);
  });
}

export { generateAll, generateIcon, ICON_SPECS };
