/**
 * Environment Configuration Module
 *
 * Provides type-safe access to environment variables with validation.
 * Uses Vite environment variables (import.meta.env) for Capacitor builds.
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

  /** Project owner */
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
 * Get the current app environment from Vite env
 */
function getAppEnv(): AppEnvironment {
  const appEnv = import.meta.env.VITE_APP_ENV;

  if (appEnv === 'staging' || appEnv === 'production') {
    return appEnv;
  }

  return 'development';
}

/**
 * Create the environment configuration object
 */
function createEnvConfig(): EnvironmentConfig {
  const appEnv = getAppEnv();

  return {
    appEnv,
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || appEnv !== 'production',
    githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
    easProjectId: import.meta.env.VITE_PROJECT_ID || '',
    easOwner: import.meta.env.VITE_PROJECT_OWNER || 'thumbcode',
    isDev: appEnv === 'development',
    isStaging: appEnv === 'staging',
    isProd: appEnv === 'production',
    version: import.meta.env.VITE_APP_VERSION || '0.0.0',
    buildNumber: import.meta.env.VITE_BUILD_NUMBER || '1',
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

export default env;
