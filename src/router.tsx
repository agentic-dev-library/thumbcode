/**
 * Application Router
 *
 * Defines the full route hierarchy, matching the previous expo-router
 * file structure:
 *
 *   /                        → Home (tab)
 *   /projects                → Project list (tab)
 *   /agents                  → Agent list (tab)
 *   /chat                    → Chat (tab)
 *   /settings                → Settings (tab)
 *   /settings/agents         → Agent settings
 *   /settings/credentials    → Credential settings
 *   /settings/editor         → Editor settings
 *   /project/:id             → Project detail
 *   /agent/:id               → Agent detail
 *   /onboarding/welcome      → Onboarding: welcome
 *   /onboarding/github-auth  → Onboarding: GitHub auth
 *   /onboarding/api-keys     → Onboarding: API keys
 *   /onboarding/create-project → Onboarding: create project
 *   /onboarding/complete     → Onboarding: complete
 *   *                        → 404 Not Found
 */

import { Route, Routes } from 'react-router-dom';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { RootLayout } from '@/layouts/RootLayout';
import { TabLayout } from '@/layouts/TabLayout';
// Detail screens (migrated from React Native)
import { AgentDetail } from '@/pages/detail/AgentDetail';
import { ProjectDetail } from '@/pages/detail/ProjectDetail';
import { NotFoundPage } from '@/pages/NotFound';
import ApiKeysPage from '@/pages/onboarding/api-keys';
import CompletePage from '@/pages/onboarding/complete';
import CreateProjectPage from '@/pages/onboarding/create-project';
import GitHubAuthPage from '@/pages/onboarding/github-auth';
// Onboarding screens (migrated from React Native)
import WelcomePage from '@/pages/onboarding/welcome';
import { PlaceholderPage } from '@/pages/placeholder';

// Settings sub-screens (migrated from React Native)
import { AgentSettings } from '@/pages/settings/AgentSettings';
import { CredentialSettings } from '@/pages/settings/CredentialSettings';
import { EditorSettings } from '@/pages/settings/EditorSettings';
import AgentsPage from '@/pages/tabs/agents';
import ChatPage from '@/pages/tabs/chat';
// Tab screens (migrated from React Native)
import HomePage from '@/pages/tabs/home';
import ProjectsPage from '@/pages/tabs/projects';
import SettingsPage from '@/pages/tabs/settings';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Main app with tab navigation */}
        <Route element={<TabLayout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Settings sub-routes (outside tabs, own header) */}
        <Route path="settings/agents" element={<AgentSettings />} />
        <Route path="settings/credentials" element={<CredentialSettings />} />
        <Route path="settings/editor" element={<EditorSettings />} />

        {/* Detail pages (outside tabs, own header) */}
        <Route path="project/:id" element={<ProjectDetail />} />
        <Route path="agent/:id" element={<AgentDetail />} />

        {/* Onboarding flow */}
        <Route path="onboarding" element={<OnboardingLayout />}>
          <Route path="welcome" element={<WelcomePage />} />
          <Route path="github-auth" element={<GitHubAuthPage />} />
          <Route path="api-keys" element={<ApiKeysPage />} />
          <Route path="create-project" element={<CreateProjectPage />} />
          <Route path="complete" element={<CompletePage />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
