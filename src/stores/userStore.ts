/**
 * User Store
 *
 * Manages user preferences, settings, and profile information.
 * Does NOT store sensitive credentials - those go in CredentialStore.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Theme preference
export type ThemeMode = 'light' | 'dark' | 'system';

// Editor preferences
export interface EditorPreferences {
  fontSize: number;
  fontFamily: 'jetbrains-mono' | 'fira-code' | 'source-code-pro';
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  highlightActiveLine: boolean;
}

// Notification preferences
export interface NotificationPreferences {
  pushEnabled: boolean;
  soundEnabled: boolean;
  agentUpdates: boolean;
  prApprovals: boolean;
  chatMessages: boolean;
}

// Agent preferences
export interface AgentPreferences {
  defaultProvider: 'anthropic' | 'openai';
  autoApproveMinorChanges: boolean;
  requireApprovalForPush: boolean;
  requireApprovalForMerge: boolean;
  maxConcurrentAgents: number;
}

// GitHub user profile (public info only)
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

// User settings
export interface UserSettings {
  theme: ThemeMode;
  editor: EditorPreferences;
  notifications: NotificationPreferences;
  agents: AgentPreferences;
}

// Default settings
const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 14,
  fontFamily: 'jetbrains-mono',
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: true,
  highlightActiveLine: true,
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  soundEnabled: true,
  agentUpdates: true,
  prApprovals: true,
  chatMessages: true,
};

const DEFAULT_AGENT_PREFERENCES: AgentPreferences = {
  defaultProvider: 'anthropic',
  autoApproveMinorChanges: false,
  requireApprovalForPush: true,
  requireApprovalForMerge: true,
  maxConcurrentAgents: 4,
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  editor: DEFAULT_EDITOR_PREFERENCES,
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  agents: DEFAULT_AGENT_PREFERENCES,
};

interface UserState {
  // State
  isAuthenticated: boolean;
  isOnboarded: boolean;
  githubProfile: GitHubProfile | null;
  settings: UserSettings;
  lastActiveAt: string | null;

  // Auth actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setOnboarded: (isOnboarded: boolean) => void;
  setGitHubProfile: (profile: GitHubProfile | null) => void;

  // Settings actions
  setTheme: (theme: ThemeMode) => void;
  updateEditorPreferences: (preferences: Partial<EditorPreferences>) => void;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateAgentPreferences: (preferences: Partial<AgentPreferences>) => void;
  resetSettings: () => void;

  // Activity tracking
  updateLastActive: () => void;

  // Logout
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      immer((set) => ({
        isAuthenticated: false,
        isOnboarded: false,
        githubProfile: null,
        settings: DEFAULT_SETTINGS,
        lastActiveAt: null,

        setAuthenticated: (isAuthenticated) =>
          set((state) => {
            state.isAuthenticated = isAuthenticated;
            if (isAuthenticated) {
              state.lastActiveAt = new Date().toISOString();
            }
          }),

        setOnboarded: (isOnboarded) =>
          set((state) => {
            state.isOnboarded = isOnboarded;
          }),

        setGitHubProfile: (profile) =>
          set((state) => {
            state.githubProfile = profile;
          }),

        setTheme: (theme) =>
          set((state) => {
            state.settings.theme = theme;
          }),

        updateEditorPreferences: (preferences) =>
          set((state) => {
            Object.assign(state.settings.editor, preferences);
          }),

        updateNotificationPreferences: (preferences) =>
          set((state) => {
            Object.assign(state.settings.notifications, preferences);
          }),

        updateAgentPreferences: (preferences) =>
          set((state) => {
            Object.assign(state.settings.agents, preferences);
          }),

        resetSettings: () =>
          set((state) => {
            state.settings = DEFAULT_SETTINGS;
          }),

        updateLastActive: () =>
          set((state) => {
            state.lastActiveAt = new Date().toISOString();
          }),

        logout: () =>
          set((state) => {
            state.isAuthenticated = false;
            state.githubProfile = null;
            // Keep settings and onboarded status
          }),
      })),
      {
        name: 'thumbcode-user-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'UserStore' }
  )
);

// Selectors for optimal re-renders
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectIsOnboarded = (state: UserState) => state.isOnboarded;
export const selectGitHubProfile = (state: UserState) => state.githubProfile;
export const selectSettings = (state: UserState) => state.settings;
export const selectTheme = (state: UserState) => state.settings.theme;
export const selectEditorPreferences = (state: UserState) => state.settings.editor;
export const selectNotificationPreferences = (state: UserState) => state.settings.notifications;
export const selectAgentPreferences = (state: UserState) => state.settings.agents;
export const selectIsNewUser = (state: UserState) => !state.isOnboarded && !state.isAuthenticated;
export const selectNeedsSetup = (state: UserState) => state.isAuthenticated && !state.isOnboarded;
