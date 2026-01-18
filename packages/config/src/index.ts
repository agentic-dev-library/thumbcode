/**
 * @thumbcode/config
 *
 * Application configuration, environment variables, constants, and feature flags.
 */

// Environment
export {
  env,
  validateEnvironment,
  type AppEnvironment,
  type EnvironmentConfig,
  type ValidationResult,
} from './env';

// Constants
export {
  AGENT_CONFIG,
  API_URLS,
  FILE_LIMITS,
  GIT_CONFIG,
  GITHUB_OAUTH,
  RATE_LIMITS,
  SECURE_STORE_KEYS,
  STORAGE_KEYS,
  SUPPORTED_LANGUAGES,
  UI_CONFIG,
  type SupportedLanguage,
} from './constants';

// Features
export {
  clearFeatureOverrides,
  getEnabledFeatures,
  getFeatureConfig,
  isFeatureEnabled,
  isFeatureEnabledWithOverrides,
  overrideFeature,
  type FeatureFlag,
} from './features';
