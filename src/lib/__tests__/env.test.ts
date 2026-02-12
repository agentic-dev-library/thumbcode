/**
 * Environment Configuration Tests
 */

// Mock expo-constants before importing env module

// Import after mocking
import { apiUrls, env, isFeatureEnabled, validateEnvironment } from '../env';

describe('env module', () => {
  describe('env configuration', () => {
    it('should export default environment values', () => {
      expect(env.appEnv).toBe('development');
      expect(env.isDev).toBe(true);
      expect(env.isStaging).toBe(false);
      expect(env.isProd).toBe(false);
    });

    it('should have enableDevTools set correctly', () => {
      expect(env.enableDevTools).toBe(true);
    });

    it('should have githubClientId from constants', () => {
      expect(env.githubClientId).toBe('test-client-id');
    });

    it('should have easProjectId from constants', () => {
      expect(env.easProjectId).toBe('test-project-id');
    });
  });

  describe('validateEnvironment', () => {
    it('should return valid result when all vars are set', () => {
      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return warnings array', () => {
      const result = validateEnvironment();

      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for devTools in development', () => {
      expect(isFeatureEnabled('devTools')).toBe(true);
    });

    it('should return false for analytics in development', () => {
      expect(isFeatureEnabled('analytics')).toBe(false);
    });

    it('should return false for crashReporting in development', () => {
      expect(isFeatureEnabled('crashReporting')).toBe(false);
    });
  });

  describe('apiUrls', () => {
    it('should export correct API URLs', () => {
      expect(apiUrls.github).toBe('https://api.github.com');
      expect(apiUrls.anthropic).toBe('https://api.anthropic.com');
      expect(apiUrls.openai).toBe('https://api.openai.com/v1');
    });
  });
});
