/**
 * Environment Configuration Module
 *
 * Provides type-safe access to environment variables with validation.
 * Uses expo-constants to access runtime configuration from app.config.ts.
 *
 * Usage:
 * ```typescript
 * import { env, validateEnvironment } from '@thumbcode/config/env';
 *
 * // Access environment variables
 * console.log(env.appEnv); // 'development' | 'staging' | 'production'
 *
 * // Validate at app startup
 * const result = validateEnvironment();
 * if (!result.isValid) {
 *   console.error('Missing env vars:', result.missing);
 * }
 * ```
 */

import Constants from 'expo-constants';

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

  /** Expo project ID */
  easProjectId: string;

  /** Expo owner (account name) */
  easOwner: string;

  /** Whether we're running in development mode */
  isDev: boolean;

  /** Whether we're running in staging mode */
  isStaging: boolean;

  /** Whether we're running in production mode */
  isProd: boolean;

  /** App version */
  version: string;

  /** Build number */
  buildNumber: string;
}

/**
 * Required environment variables for each environment
 */
const REQUIRED_VARS: Record<AppEnvironment, (keyof EnvironmentConfig)[]> = {
  development: [], // No strict requirements in dev
  staging: ['githubClientId'],
  production: ['githubClientId', 'easProjectId'],
};

/**
 * Get the current app environment from Expo Constants
 */
function getAppEnv(): AppEnvironment {
  const extra = Constants.expoConfig?.extra;
  const appEnv = extra?.appEnv;

  if (appEnv === 'staging' || appEnv === 'production') {
    return appEnv;
  }

  return 'development';
}

/**
 * Create the environment configuration object
 */
function createEnvConfig(): EnvironmentConfig {
  const extra = Constants.expoConfig?.extra || {};
  const appEnv = getAppEnv();

  return {
    appEnv,
    enableDevTools: extra.enableDevTools ?? appEnv !== 'production',
    githubClientId: extra.githubClientId || '',
    easProjectId: extra.eas?.projectId || '',
    easOwner: extra.eas?.owner || 'thumbcode',
    isDev: appEnv === 'development',
    isStaging: appEnv === 'staging',
    isProd: appEnv === 'production',
    version: Constants.expoConfig?.version || '0.0.0',
    buildNumber: Constants.expoConfig?.ios?.buildNumber ||
      Constants.expoConfig?.android?.versionCode?.toString() ||
      '1',
  };
}

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
    const value = env[varName];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(varName);
    }
  }

  // Add warnings for common issues
  if (env.isProd && !env.easProjectId) {
    warnings.push('EXPO_PROJECT_ID is not set - EAS builds may fail');
  }

  if (!env.githubClientId) {
    warnings.push('EXPO_PUBLIC_GITHUB_CLIENT_ID is not set - GitHub auth will be disabled');
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

export default env;
