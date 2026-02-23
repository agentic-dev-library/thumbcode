/**
 * User Store Tests
 */

import { act, renderHook } from '@testing-library/react';
import {
  selectAgentPreferences,
  selectEditorPreferences,
  selectGitHubProfile,
  selectIsAuthenticated,
  selectIsNewUser,
  selectIsOnboarded,
  selectNeedsSetup,
  selectTheme,
  useUserStore,
} from '../userStore';

// Reset store before each test
beforeEach(() => {
  useUserStore.setState({
    isAuthenticated: false,
    isOnboarded: false,
    githubProfile: null,
    settings: {
      theme: 'system',
      editor: {
        fontSize: 14,
        fontFamily: 'jetbrains-mono',
        tabSize: 2,
        wordWrap: true,
        showLineNumbers: true,
        highlightActiveLine: true,
      },
      notifications: {
        pushEnabled: true,
        soundEnabled: true,
        hapticsEnabled: true,
        agentUpdates: true,
        prApprovals: true,
        chatMessages: true,
      },
      agents: {
        defaultProvider: 'anthropic',
        autoApproveMinorChanges: false,
        requireApprovalForPush: true,
        requireApprovalForMerge: true,
        maxConcurrentAgents: 4,
      },
    },
    lastActiveAt: null,
  });
});

describe('UserStore', () => {
  describe('authentication', () => {
    it('should set authenticated status', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.isAuthenticated).toBe(false);

      act(() => {
        result.current.setAuthenticated(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.lastActiveAt).toBeDefined();
    });

    it('should set onboarded status', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.isOnboarded).toBe(false);

      act(() => {
        result.current.setOnboarded(true);
      });

      expect(result.current.isOnboarded).toBe(true);
    });

    it('should set GitHub profile', () => {
      const { result } = renderHook(() => useUserStore());

      const profile = {
        login: 'testuser',
        id: 12345,
        avatarUrl: 'https://example.com/avatar.png',
        name: 'Test User',
        email: 'test@example.com',
        publicRepos: 10,
        followers: 5,
        following: 3,
      };

      act(() => {
        result.current.setGitHubProfile(profile);
      });

      expect(result.current.githubProfile).toEqual(profile);
    });

    it('should logout and clear profile', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setAuthenticated(true);
        result.current.setGitHubProfile({
          login: 'testuser',
          id: 12345,
          avatarUrl: 'https://example.com/avatar.png',
          publicRepos: 10,
          followers: 5,
          following: 3,
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.githubProfile).not.toBeNull();

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.githubProfile).toBeNull();
    });
  });

  describe('settings', () => {
    it('should set theme', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.settings.theme).toBe('system');

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.settings.theme).toBe('dark');
    });

    it('should update editor preferences', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateEditorPreferences({
          fontSize: 16,
          tabSize: 4,
        });
      });

      expect(result.current.settings.editor.fontSize).toBe(16);
      expect(result.current.settings.editor.tabSize).toBe(4);
      // Other values should remain unchanged
      expect(result.current.settings.editor.wordWrap).toBe(true);
    });

    it('should update notification preferences', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateNotificationPreferences({
          pushEnabled: false,
          soundEnabled: false,
        });
      });

      expect(result.current.settings.notifications.pushEnabled).toBe(false);
      expect(result.current.settings.notifications.soundEnabled).toBe(false);
    });

    it('should update agent preferences', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updateAgentPreferences({
          defaultProvider: 'openai',
          maxConcurrentAgents: 2,
        });
      });

      expect(result.current.settings.agents.defaultProvider).toBe('openai');
      expect(result.current.settings.agents.maxConcurrentAgents).toBe(2);
    });

    it('should reset settings to defaults', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.updateEditorPreferences({ fontSize: 20 });
      });

      expect(result.current.settings.theme).toBe('dark');
      expect(result.current.settings.editor.fontSize).toBe(20);

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings.theme).toBe('system');
      expect(result.current.settings.editor.fontSize).toBe(14);
    });
  });

  describe('selectors', () => {
    it('selectIsAuthenticated should return authentication status', () => {
      useUserStore.setState({ isAuthenticated: true });
      expect(selectIsAuthenticated(useUserStore.getState())).toBe(true);
    });

    it('selectIsOnboarded should return onboarding status', () => {
      useUserStore.setState({ isOnboarded: true });
      expect(selectIsOnboarded(useUserStore.getState())).toBe(true);
    });

    it('selectGitHubProfile should return the profile', () => {
      const profile = {
        login: 'test',
        id: 1,
        avatarUrl: 'test.png',
        publicRepos: 0,
        followers: 0,
        following: 0,
      };
      useUserStore.setState({ githubProfile: profile });
      expect(selectGitHubProfile(useUserStore.getState())).toEqual(profile);
    });

    it('selectTheme should return theme setting', () => {
      const state = useUserStore.getState();
      state.settings.theme = 'light';
      useUserStore.setState(state);
      expect(selectTheme(useUserStore.getState())).toBe('light');
    });

    it('selectEditorPreferences should return editor settings', () => {
      const prefs = selectEditorPreferences(useUserStore.getState());
      expect(prefs.fontSize).toBe(14);
      expect(prefs.fontFamily).toBe('jetbrains-mono');
    });

    it('selectAgentPreferences should return agent settings', () => {
      const prefs = selectAgentPreferences(useUserStore.getState());
      expect(prefs.defaultProvider).toBe('anthropic');
      expect(prefs.maxConcurrentAgents).toBe(4);
    });

    it('selectIsNewUser should return true when not authenticated and not onboarded', () => {
      useUserStore.setState({ isAuthenticated: false, isOnboarded: false });
      expect(selectIsNewUser(useUserStore.getState())).toBe(true);
    });

    it('selectNeedsSetup should return true when authenticated but not onboarded', () => {
      useUserStore.setState({ isAuthenticated: true, isOnboarded: false });
      expect(selectNeedsSetup(useUserStore.getState())).toBe(true);
    });

    it('selectNeedsSetup should return false when authenticated and onboarded', () => {
      useUserStore.setState({ isAuthenticated: true, isOnboarded: true });
      expect(selectNeedsSetup(useUserStore.getState())).toBe(false);
    });
  });
});
