/**
 * Constants Tests
 *
 * Verifies that all application constants are properly defined
 * and have expected shapes and values.
 */

import {
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
} from '../constants';

describe('Constants', () => {
  describe('API_URLS', () => {
    it('defines GitHub API URL', () => {
      expect(API_URLS.github).toBe('https://api.github.com');
    });

    it('defines Anthropic API URL', () => {
      expect(API_URLS.anthropic).toBe('https://api.anthropic.com');
    });

    it('defines OpenAI API URL', () => {
      expect(API_URLS.openai).toBe('https://api.openai.com/v1');
    });
  });

  describe('GITHUB_OAUTH', () => {
    it('defines device code URL', () => {
      expect(GITHUB_OAUTH.deviceCodeUrl).toContain('/login/device/code');
    });

    it('defines access token URL', () => {
      expect(GITHUB_OAUTH.accessTokenUrl).toContain('/login/oauth/access_token');
    });

    it('has reasonable poll interval (at least 1 second)', () => {
      expect(GITHUB_OAUTH.pollInterval).toBeGreaterThanOrEqual(1000);
    });

    it('has max poll attempts defined', () => {
      expect(GITHUB_OAUTH.maxPollAttempts).toBeGreaterThan(0);
    });

    it('defines default scopes', () => {
      expect(GITHUB_OAUTH.scopes).toContain('repo');
      expect(GITHUB_OAUTH.scopes).toContain('user');
    });
  });

  describe('SECURE_STORE_KEYS', () => {
    it('defines keys for all major providers', () => {
      expect(SECURE_STORE_KEYS.github).toBeDefined();
      expect(SECURE_STORE_KEYS.anthropic).toBeDefined();
      expect(SECURE_STORE_KEYS.openai).toBeDefined();
    });

    it('uses thumbcode prefix for all keys', () => {
      for (const value of Object.values(SECURE_STORE_KEYS)) {
        expect(value).toMatch(/^thumbcode_/);
      }
    });
  });

  describe('STORAGE_KEYS', () => {
    it('defines keys for all major data stores', () => {
      expect(STORAGE_KEYS.userSettings).toBeDefined();
      expect(STORAGE_KEYS.credentials).toBeDefined();
      expect(STORAGE_KEYS.projects).toBeDefined();
      expect(STORAGE_KEYS.agents).toBeDefined();
      expect(STORAGE_KEYS.chat).toBeDefined();
      expect(STORAGE_KEYS.onboarding).toBeDefined();
    });

    it('uses thumbcode prefix for all keys', () => {
      for (const value of Object.values(STORAGE_KEYS)) {
        expect(value).toMatch(/^thumbcode-/);
      }
    });
  });

  describe('GIT_CONFIG', () => {
    it('defaults to main branch', () => {
      expect(GIT_CONFIG.defaultBranch).toBe('main');
    });

    it('has positive shallow clone depth', () => {
      expect(GIT_CONFIG.defaultDepth).toBeGreaterThan(0);
    });

    it('has reasonable fetch interval', () => {
      expect(GIT_CONFIG.fetchInterval).toBeGreaterThan(0);
    });
  });

  describe('AGENT_CONFIG', () => {
    it('allows multiple concurrent agents', () => {
      expect(AGENT_CONFIG.maxConcurrent).toBeGreaterThanOrEqual(1);
    });

    it('specifies a default model', () => {
      expect(AGENT_CONFIG.defaultModel).toBeTruthy();
    });

    it('has reasonable temperature', () => {
      expect(AGENT_CONFIG.defaultTemperature).toBeGreaterThanOrEqual(0);
      expect(AGENT_CONFIG.defaultTemperature).toBeLessThanOrEqual(2);
    });

    it('has positive max tokens', () => {
      expect(AGENT_CONFIG.defaultMaxTokens).toBeGreaterThan(0);
    });

    it('has task timeout defined', () => {
      expect(AGENT_CONFIG.taskTimeout).toBeGreaterThan(0);
    });
  });

  describe('UI_CONFIG', () => {
    it('has positive animation duration', () => {
      expect(UI_CONFIG.animationDuration).toBeGreaterThan(0);
    });

    it('has positive debounce delay', () => {
      expect(UI_CONFIG.debounceDelay).toBeGreaterThan(0);
    });
  });

  describe('RATE_LIMITS', () => {
    it('defines GitHub rate limits', () => {
      expect(RATE_LIMITS.github.core).toBeGreaterThan(0);
      expect(RATE_LIMITS.github.search).toBeGreaterThan(0);
    });

    it('defines Anthropic rate limits', () => {
      expect(RATE_LIMITS.anthropic.requestsPerMinute).toBeGreaterThan(0);
    });

    it('defines OpenAI rate limits', () => {
      expect(RATE_LIMITS.openai.requestsPerMinute).toBeGreaterThan(0);
    });
  });

  describe('FILE_LIMITS', () => {
    it('has reasonable max file size', () => {
      expect(FILE_LIMITS.maxFileSizeBytes).toBeGreaterThan(0);
    });

    it('max diff size is smaller than max file size', () => {
      expect(FILE_LIMITS.maxDiffSizeBytes).toBeLessThanOrEqual(FILE_LIMITS.maxFileSizeBytes);
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('includes TypeScript and JavaScript', () => {
      expect(SUPPORTED_LANGUAGES).toContain('typescript');
      expect(SUPPORTED_LANGUAGES).toContain('javascript');
    });

    it('includes Python', () => {
      expect(SUPPORTED_LANGUAGES).toContain('python');
    });

    it('has at least 10 languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
    });
  });
});
