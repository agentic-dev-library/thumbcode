/**
 * @thumbcode/config
 *
 * Application configuration, environment variables, constants, and feature flags.
 */

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
  type SupportedLanguage,
  UI_CONFIG,
} from './constants';
// Environment
export {
  type AppEnvironment,
  type EnvironmentConfig,
  env,
  type ValidationResult,
  validateEnvironment,
} from './env';

// Features
export {
  clearFeatureOverrides,
  type FeatureFlag,
  getEnabledFeatures,
  getFeatureConfig,
  isFeatureEnabled,
  isFeatureEnabledWithOverrides,
  overrideFeature,
} from './features';

// Provider Registry
export {
  type CapabilitySupport,
  getProvider,
  getProvidersWithCapability,
  getProviderTier,
  PROVIDER_REGISTRY,
  type ProviderCapability,
  type ProviderCapabilityEntry,
  supportsCapability,
  validateProviderForTask,
} from './provider-registry';
