/**
 * Environment Configuration Module
 *
 * Provides type-safe access to environment variables with validation.
 * Uses Vite environment variables (import.meta.env) for Capacitor builds.
 *
 * Usage:
 * ```typescript
 * import { env, validateEnvironment } from '@/lib/env';
 *
 * // Access environment variables
 * console.log(env.appEnv); // 'development' | 'staging' | 'production'
 *
 * // Validate at app startup (optional, logs warnings for missing vars)
 * validateEnvironment();
 * ```
 */

/**
 * App environment type
 */
export type AppEnvironment = 'development' | 'staging' | 'production';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  /** Current app environment */
  appEnv: AppEnvironment;

  /** Whether development tools are enabled */
  enableDevTools: boolean;

  /** GitHub OAuth client ID for Device Flow */
  githubClientId: string;

  /** Project ID (replaces EAS project ID) */
  easProjectId: string;

  /** Whether we're running in development mode */
  isDev: boolean;

  /** Whether we're running in staging mode */
  isStaging: boolean;

  /** Whether we're running in production mode */
  isProd: boolean;
}

/**
 * Required environment variables for each environment
 */
const REQUIRED_VARS = {
  development: [] as string[], // No strict requirements in dev
  staging: ['githubClientId'] as string[],
  production: ['githubClientId', 'easProjectId'] as string[],
} as const;

/**
 * Get the current app environment from Vite env
 */
const getAppEnv = (): AppEnvironment => {
  const appEnv = import.meta.env.VITE_APP_ENV;

  if (appEnv === 'staging' || appEnv === 'production') {
    return appEnv;
  }

  return 'development';
};

/**
 * Create the environment configuration object
 */
const createEnvConfig = (): EnvironmentConfig => {
  const appEnv = getAppEnv();

  return {
    appEnv,
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || appEnv !== 'production',
    githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
    easProjectId: import.meta.env.VITE_PROJECT_ID || '',
    isDev: appEnv === 'development',
    isStaging: appEnv === 'staging',
    isProd: appEnv === 'production',
  };
};

/**
 * Environment configuration singleton
 */
export const env = createEnvConfig();

/**
 * Validation result for environment check
 */
export interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate that all required environment variables are set
 *
 * @returns Validation result with missing variables
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  const requiredVars = REQUIRED_VARS[env.appEnv];

  for (const varName of requiredVars) {
    const value = env[varName as keyof EnvironmentConfig];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(varName);
    }
  }

  // Add warnings for common issues
  if (env.isProd && !env.easProjectId) {
    warnings.push('VITE_PROJECT_ID is not set - builds may fail');
  }

  if (!env.githubClientId) {
    warnings.push('VITE_GITHUB_CLIENT_ID is not set - GitHub auth will be disabled');
  }

  // Log warnings in development
  if (env.isDev) {
    for (const warning of warnings) {
      console.warn(`[ENV] ${warning}`);
    }

    if (missing.length > 0) {
      console.warn(`[ENV] Missing required variables: ${missing.join(', ')}`);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Check if a specific feature is enabled based on environment
 *
 * @param feature - Feature name to check
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: 'devTools' | 'analytics' | 'crashReporting'): boolean {
  switch (feature) {
    case 'devTools':
      return env.enableDevTools;
    case 'analytics':
      return env.isProd; // Only in production
    case 'crashReporting':
      return !env.isDev; // Staging and production
    default:
      return false;
  }
}

/**
 * Get API base URLs based on environment
 */
export const apiUrls = {
  github: 'https://api.github.com',
  anthropic: 'https://api.anthropic.com',
  openai: 'https://api.openai.com/v1',
} as const;

/**
 * Re-export for convenience
 */
export default env;
