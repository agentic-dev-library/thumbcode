/**
 * Feature Flags Module
 *
 * Centralized feature flag management for ThumbCode.
 * Allows enabling/disabling features based on environment.
 */

import { env } from './env';

/**
 * Feature flag names
 */
export type FeatureFlag =
  | 'devTools'
  | 'analytics'
  | 'crashReporting'
  | 'multiAgent'
  | 'offlineMode'
  | 'i18n'
  | 'darkMode'
  | 'biometricAuth'
  | 'mcpServers'
  | 'gitLabSupport'
  | 'bitbucketSupport';

/**
 * Feature flag configuration
 */
interface FeatureFlagConfig {
  enabled: boolean;
  description: string;
  environments: ('development' | 'staging' | 'production')[];
}

/**
 * Feature flag definitions
 */
const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  devTools: {
    enabled: true,
    description: 'Developer tools and debugging features',
    environments: ['development'],
  },
  analytics: {
    enabled: true,
    description: 'Anonymous usage analytics',
    environments: ['staging', 'production'],
  },
  crashReporting: {
    enabled: true,
    description: 'Automatic crash reporting',
    environments: ['staging', 'production'],
  },
  multiAgent: {
    enabled: true,
    description: 'Multi-agent orchestration system',
    environments: ['development', 'staging', 'production'],
  },
  offlineMode: {
    enabled: false,
    description: 'Offline mode with local caching',
    environments: ['development', 'staging', 'production'],
  },
  i18n: {
    enabled: false,
    description: 'Internationalization support',
    environments: ['development', 'staging', 'production'],
  },
  darkMode: {
    enabled: true,
    description: 'Dark mode theme support',
    environments: ['development', 'staging', 'production'],
  },
  biometricAuth: {
    enabled: true,
    description: 'Biometric authentication for credentials',
    environments: ['development', 'staging', 'production'],
  },
  mcpServers: {
    enabled: true,
    description: 'MCP server integration',
    environments: ['development', 'staging', 'production'],
  },
  gitLabSupport: {
    enabled: false,
    description: 'GitLab repository support',
    environments: ['development', 'staging', 'production'],
  },
  bitbucketSupport: {
    enabled: false,
    description: 'Bitbucket repository support',
    environments: ['development', 'staging', 'production'],
  },
};

/**
 * Check if a feature is enabled
 *
 * @param feature - Feature flag to check
 * @returns Whether the feature is enabled for current environment
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const config = FEATURE_FLAGS[feature];
  if (!config) {
    return false;
  }

  // Check if feature is enabled at all
  if (!config.enabled) {
    return false;
  }

  // Check if current environment is in allowed environments
  return config.environments.includes(env.appEnv);
}

/**
 * Get all enabled features for current environment
 *
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlag[]).filter(isFeatureEnabled);
}

/**
 * Get feature flag configuration
 *
 * @param feature - Feature flag name
 * @returns Feature configuration or undefined
 */
export function getFeatureConfig(feature: FeatureFlag): FeatureFlagConfig | undefined {
  return FEATURE_FLAGS[feature];
}

/**
 * Override feature flag for testing/development
 * Only works in development environment
 */
const featureOverrides = new Map<FeatureFlag, boolean>();

export function overrideFeature(feature: FeatureFlag, enabled: boolean): void {
  if (!env.isDev) {
    console.warn('Feature overrides only work in development');
    return;
  }
  featureOverrides.set(feature, enabled);
}

export function clearFeatureOverrides(): void {
  featureOverrides.clear();
}

/**
 * Check if feature is enabled (with override support)
 */
export function isFeatureEnabledWithOverrides(feature: FeatureFlag): boolean {
  // Check for override first (dev only)
  if (env.isDev && featureOverrides.has(feature)) {
    return featureOverrides.get(feature)!;
  }
  return isFeatureEnabled(feature);
}
