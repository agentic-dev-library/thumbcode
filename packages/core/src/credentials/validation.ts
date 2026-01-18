const GITHUB_TOKEN_REGEX = /^ghp_[a-zA-Z0-9]{36}$/;
const ANTHROPIC_KEY_REGEX = /^sk-ant-api03-[a-zA-Z0-9_-]{95}$/;

export const validateGitHubToken = (token: string): boolean => {
  return GITHUB_TOKEN_REGEX.test(token);
};

export const validateAnthropicKey = (key: string): boolean => {
  return ANTHROPIC_KEY_REGEX.test(key);
};
