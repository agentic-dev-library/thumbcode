/**
 * Navigation Type Definitions
 */

export type RootStackParamList = {
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'project/[id]': { id: string };
  'agent/[id]': { id: string };
  'workspace/[id]': { id: string };
  settings: undefined;
};

export type OnboardingStackParamList = {
  welcome: undefined;
  'github-auth': undefined;
  'api-keys': undefined;
  'create-project': undefined;
  complete: undefined;
};

export type TabParamList = {
  index: undefined;
  projects: undefined;
  agents: undefined;
  chat: undefined;
  settings: undefined;
};
