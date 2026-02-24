/**
 * Application Constants
 *
 * Centralized constants for the ThumbCode application.
 */

/**
 * API base URLs
 */
export const API_URLS = {
  github: 'https://api.github.com',
  githubAuth: 'https://github.com',
  anthropic: 'https://api.anthropic.com',
  openai: 'https://api.openai.com/v1',
} as const;

/**
 * GitHub OAuth configuration
 */
export const GITHUB_OAUTH = {
  deviceCodeUrl: 'https://github.com/login/device/code',
  accessTokenUrl: 'https://github.com/login/oauth/access_token',
  verificationUri: 'https://github.com/login/device',
  scopes: 'repo,user,read:org',
  pollInterval: 5000, // 5 seconds
  maxPollAttempts: 60, // 5 minutes max
} as const;

/**
 * Secure store keys
 */
export const SECURE_STORE_KEYS = {
  github: 'thumbcode_cred_github',
  anthropic: 'thumbcode_cred_anthropic',
  openai: 'thumbcode_cred_openai',
  gitlab: 'thumbcode_cred_gitlab',
  bitbucket: 'thumbcode_cred_bitbucket',
  mcpServer: 'thumbcode_cred_mcp',
} as const;

/**
 * Async storage keys
 */
export const STORAGE_KEYS = {
  userSettings: 'thumbcode-user-settings',
  credentials: 'thumbcode-credentials',
  projects: 'thumbcode-projects',
  agents: 'thumbcode-agents',
  chat: 'thumbcode-chat',
  onboarding: 'thumbcode-onboarding',
} as const;

/**
 * Git configuration
 */
export const GIT_CONFIG = {
  defaultBranch: 'main',
  repoBaseDir: 'repos',
  worktreeBaseDir: 'worktrees',
  defaultDepth: 1, // Shallow clone by default
  fetchInterval: 300000, // 5 minutes
} as const;

/**
 * Agent configuration
 */
export const AGENT_CONFIG = {
  maxConcurrent: 4,
  defaultModel: 'claude-sonnet-4-20250514',
  defaultTemperature: 0.7,
  defaultMaxTokens: 4096,
  taskTimeout: 300000, // 5 minutes
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  animationDuration: 200,
  toastDuration: 3000,
  debounceDelay: 300,
  maxFileTreeDepth: 10,
  maxDiffLines: 1000,
} as const;

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  github: {
    core: 5000, // requests per hour
    search: 30, // requests per minute
  },
  anthropic: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  },
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 150000,
  },
} as const;

/**
 * File size limits
 */
export const FILE_LIMITS = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  maxDiffSizeBytes: 1 * 1024 * 1024, // 1MB
  maxContextFiles: 20,
  maxCloneDepth: 10,
} as const;

/**
 * Supported languages for syntax highlighting
 */
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'rust',
  'go',
  'java',
  'kotlin',
  'swift',
  'c',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'shell',
  'sql',
  'json',
  'yaml',
  'markdown',
  'html',
  'css',
  'scss',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
