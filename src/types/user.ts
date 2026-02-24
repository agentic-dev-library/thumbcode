/**
 * User Type Definitions
 *
 * Types for user profiles and preferences.
 */

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * User entity
 */
export interface User {
  id: string;
  email?: string;
  displayName: string;
  avatar?: string;
  credentials: string[]; // Credential IDs
  projects: string[]; // Project IDs
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: ThemeMode;
  hapticFeedback: boolean;
  notifications: NotificationPreferences;
  editor: EditorPreferences;
  agents: AgentPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  pushEnabled: boolean;
  soundEnabled: boolean;
  agentUpdates: boolean;
  prApprovals: boolean;
  chatMessages: boolean;
  errorAlerts: boolean;
  dailySummary: boolean;
}

/**
 * Editor preferences
 */
export interface EditorPreferences {
  fontSize: number;
  fontFamily: 'jetbrains-mono' | 'fira-code' | 'source-code-pro';
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  highlightActiveLine: boolean;
}

/**
 * Agent preferences
 */
export interface AgentPreferences {
  defaultProvider: 'anthropic' | 'openai';
  autoApproveMinorChanges: boolean;
  requireApprovalForPush: boolean;
  requireApprovalForMerge: boolean;
  maxConcurrentAgents: number;
}

/**
 * GitHub user profile
 */
export interface GitHubProfile {
  login: string;
  id: number;
  avatarUrl: string;
  name?: string;
  email?: string;
  bio?: string;
  publicRepos: number;
  followers: number;
  following: number;
}
