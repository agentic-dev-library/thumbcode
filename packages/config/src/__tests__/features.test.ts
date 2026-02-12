/**
 * Feature Flags Tests
 *
 * Tests feature flag logic including environment-specific enabling,
 * override support, and configuration queries.
 */

import {
  clearFeatureOverrides,
  getEnabledFeatures,
  getFeatureConfig,
  isFeatureEnabled,
  isFeatureEnabledWithOverrides,
  overrideFeature,
} from '../features';

// Note: env module resolves to 'development' in tests because
// expo-constants mock returns empty extra, and getAppEnv() defaults to 'development'.

afterEach(() => {
  clearFeatureOverrides();
});

describe('Feature Flags', () => {
  describe('isFeatureEnabled', () => {
    it('enables devTools in development', () => {
      expect(isFeatureEnabled('devTools')).toBe(true);
    });

    it('enables multiAgent in all environments', () => {
      expect(isFeatureEnabled('multiAgent')).toBe(true);
    });

    it('enables darkMode in all environments', () => {
      expect(isFeatureEnabled('darkMode')).toBe(true);
    });

    it('enables biometricAuth in all environments', () => {
      expect(isFeatureEnabled('biometricAuth')).toBe(true);
    });

    it('disables offlineMode (globally disabled)', () => {
      expect(isFeatureEnabled('offlineMode')).toBe(false);
    });

    it('disables i18n (globally disabled)', () => {
      expect(isFeatureEnabled('i18n')).toBe(false);
    });

    it('disables analytics in development', () => {
      // analytics is enabled only for staging/production
      expect(isFeatureEnabled('analytics')).toBe(false);
    });

    it('disables crashReporting in development', () => {
      expect(isFeatureEnabled('crashReporting')).toBe(false);
    });

    it('disables gitLabSupport (globally disabled)', () => {
      expect(isFeatureEnabled('gitLabSupport')).toBe(false);
    });

    it('disables bitbucketSupport (globally disabled)', () => {
      expect(isFeatureEnabled('bitbucketSupport')).toBe(false);
    });
  });

  describe('getEnabledFeatures', () => {
    it('returns array of enabled feature names', () => {
      const features = getEnabledFeatures();
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it('includes devTools in development', () => {
      const features = getEnabledFeatures();
      expect(features).toContain('devTools');
    });

    it('does not include globally disabled features', () => {
      const features = getEnabledFeatures();
      expect(features).not.toContain('offlineMode');
      expect(features).not.toContain('i18n');
    });
  });

  describe('getFeatureConfig', () => {
    it('returns config for known feature', () => {
      const config = getFeatureConfig('devTools');
      expect(config).toBeDefined();
      expect(config?.description).toBeTruthy();
      expect(config?.environments).toContain('development');
    });

    it('returns config with environments array', () => {
      const config = getFeatureConfig('multiAgent');
      expect(config?.environments).toContain('development');
      expect(config?.environments).toContain('staging');
      expect(config?.environments).toContain('production');
    });
  });

  describe('Feature overrides', () => {
    it('overrides enable a disabled feature in dev', () => {
      expect(isFeatureEnabledWithOverrides('offlineMode')).toBe(false);

      overrideFeature('offlineMode', true);
      expect(isFeatureEnabledWithOverrides('offlineMode')).toBe(true);
    });

    it('overrides disable an enabled feature in dev', () => {
      expect(isFeatureEnabledWithOverrides('devTools')).toBe(true);

      overrideFeature('devTools', false);
      expect(isFeatureEnabledWithOverrides('devTools')).toBe(false);
    });

    it('clearFeatureOverrides restores defaults', () => {
      overrideFeature('offlineMode', true);
      expect(isFeatureEnabledWithOverrides('offlineMode')).toBe(true);

      clearFeatureOverrides();
      expect(isFeatureEnabledWithOverrides('offlineMode')).toBe(false);
    });

    it('isFeatureEnabled ignores overrides', () => {
      overrideFeature('offlineMode', true);
      // isFeatureEnabled should NOT use overrides
      expect(isFeatureEnabled('offlineMode')).toBe(false);
    });
  });
});
