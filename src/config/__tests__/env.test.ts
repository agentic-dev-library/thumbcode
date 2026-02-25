/**
 * Environment Config Tests
 *
 * Tests the environment configuration module including validation
 * and default values in the test (development) environment.
 */

import { env, validateEnvironment } from '../env';

describe('Environment Configuration', () => {
  describe('env singleton', () => {
    it('defaults to development environment', () => {
      expect(env.appEnv).toBe('development');
    });

    it('has isDev true in development', () => {
      expect(env.isDev).toBe(true);
    });

    it('has isStaging false in development', () => {
      expect(env.isStaging).toBe(false);
    });

    it('has isProd false in development', () => {
      expect(env.isProd).toBe(false);
    });

    it('has dev tools enabled in development', () => {
      expect(env.enableDevTools).toBe(true);
    });

    it('has a version string', () => {
      expect(typeof env.version).toBe('string');
    });

    it('has a build number string', () => {
      expect(typeof env.buildNumber).toBe('string');
    });
  });

  describe('validateEnvironment', () => {
    it('returns valid result for development (no required vars)', () => {
      const result = validateEnvironment();
      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('returns warnings array', () => {
      const result = validateEnvironment();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('has no warning when GitHub client ID has default value', () => {
      const result = validateEnvironment();
      // Default client ID is embedded, so no warning expected
      expect(result.warnings.some((w) => w.includes('GITHUB_CLIENT_ID'))).toBe(false);
    });
  });
});
