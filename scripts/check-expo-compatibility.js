#!/usr/bin/env node
/**
 * Expo Go Compatibility Checker
 *
 * This script analyzes the project configuration and reports Expo Go incompatibilities.
 * ThumbCode intentionally uses native modules for security features, so these
 * incompatibilities are expected and documented.
 *
 * Usage:
 *   node scripts/check-expo-compatibility.js
 *   pnpm run check:expo-compatibility
 *
 * Exit code is always 0 (informational) since incompatibility is intentional.
 */

const fs = require('node:fs');
const path = require('node:path');

// Known Expo Go incompatible dependencies
const INCOMPATIBLE_DEPENDENCIES = {
  'expo-secure-store': 'Hardware-backed secure credential storage',
  'expo-local-authentication': 'Biometric authentication (Face ID, fingerprint)',
  'react-native-ssl-public-key-pinning': 'SSL certificate pinning for security',
  'expo-notifications': 'Push notifications (requires native configuration)',
};

// Config plugins that require native builds
const NATIVE_CONFIG_PLUGINS = [
  'expo-secure-store',
  'expo-local-authentication',
  'expo-notifications',
];

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function checkPackageJson(projectRoot) {
  const reports = [];
  const packageJson = readJsonFile(path.join(projectRoot, 'package.json'));

  if (!packageJson) {
    console.warn('Warning: Could not read package.json');
    return reports;
  }

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  for (const [dep, reason] of Object.entries(INCOMPATIBLE_DEPENDENCIES)) {
    if (allDeps[dep]) {
      reports.push({
        category: 'Native Dependency',
        item: dep,
        reason,
      });
    }
  }

  return reports;
}

function checkAppConfig(projectRoot) {
  const reports = [];

  // Try app.json
  const appJsonPath = path.join(projectRoot, 'app.json');
  let appConfig = null;

  if (fs.existsSync(appJsonPath)) {
    appConfig = readJsonFile(appJsonPath);
  }

  // Check for app.config.ts
  const appConfigTsPath = path.join(projectRoot, 'app.config.ts');
  if (fs.existsSync(appConfigTsPath)) {
    reports.push({
      category: 'Configuration',
      item: 'app.config.ts',
      reason: 'Uses TypeScript config which may contain dynamic native plugins',
    });
  }

  if (!appConfig?.expo) {
    return reports;
  }

  // Check for New Architecture
  if (appConfig.expo.newArchEnabled) {
    reports.push({
      category: 'Configuration',
      item: 'newArchEnabled: true',
      reason: 'React Native New Architecture requires custom builds (not Expo Go)',
    });
  }

  // Check for native config plugins
  const plugins = appConfig.expo.plugins || [];
  for (const plugin of plugins) {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    if (typeof pluginName === 'string' && NATIVE_CONFIG_PLUGINS.includes(pluginName)) {
      reports.push({
        category: 'Config Plugin',
        item: pluginName,
        reason: 'Requires native code compilation',
      });
    }
  }

  return reports;
}

function checkEasJson(projectRoot) {
  const reports = [];
  const easJson = readJsonFile(path.join(projectRoot, 'eas.json'));

  if (!easJson) {
    return reports;
  }

  if (easJson.build?.development?.developmentClient) {
    reports.push({
      category: 'EAS Configuration',
      item: 'developmentClient: true',
      reason: 'Explicitly configured for development client builds (not Expo Go)',
    });
  }

  return reports;
}

function printReport(reports) {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           EXPO GO COMPATIBILITY REPORT                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (reports.length === 0) {
    console.log('✅ No Expo Go incompatibilities detected.');
    console.log('   This project may work with Expo Go.\n');
    return;
  }

  console.log(`⚠️  Found ${reports.length} Expo Go incompatibilities (this is expected):\n`);

  // Group by category
  const grouped = reports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {});

  for (const [category, items] of Object.entries(grouped)) {
    console.log(`📦 ${category}:`);
    for (const item of items) {
      console.log(`   • ${item.item}`);
      console.log(`     └─ ${item.reason}`);
    }
    console.log('');
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('ℹ️  ThumbCode intentionally requires a custom development build');
  console.log('   for security features (credential storage, biometrics, SSL');
  console.log('   pinning). This is a design decision, not a bug.');
  console.log('');
  console.log('📖 Documentation:');
  console.log('   • README.md - "Development Build Required" section');
  console.log('   • docs/development/SETUP.md - Build instructions');
  console.log('');
  console.log('🛠️  Build commands:');
  console.log('   pnpm run build:dev --platform ios     # iOS');
  console.log('   pnpm run build:dev --platform android # Android');
  console.log('');
}

function main() {
  const projectRoot = process.cwd();

  console.log(`\nAnalyzing project at: ${projectRoot}`);

  const reports = [
    ...checkPackageJson(projectRoot),
    ...checkAppConfig(projectRoot),
    ...checkEasJson(projectRoot),
  ];

  printReport(reports);

  // Always exit 0 - this is informational, not a failure
  process.exit(0);
}

main();
