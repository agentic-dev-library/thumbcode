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
import { RootLayout } from '@/layouts/RootLayout';
import { TabLayout } from '@/layouts/TabLayout';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { PlaceholderPage } from '@/pages/placeholder';
import { NotFoundPage } from '@/pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Main app with tab navigation */}
        <Route element={<TabLayout />}>
          <Route index element={<PlaceholderPage title="Home" />} />
          <Route path="projects" element={<PlaceholderPage title="Projects" />} />
          <Route path="agents" element={<PlaceholderPage title="Agents" />} />
          <Route path="chat" element={<PlaceholderPage title="Chat" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Route>

        {/* Settings sub-routes (outside tabs, own header) */}
        <Route path="settings/agents" element={<PlaceholderPage title="Agent Settings" />} />
        <Route path="settings/credentials" element={<PlaceholderPage title="Credentials" />} />
        <Route path="settings/editor" element={<PlaceholderPage title="Editor Settings" />} />

        {/* Detail pages (outside tabs, own header) */}
        <Route path="project/:id" element={<PlaceholderPage title="Project Detail" />} />
        <Route path="agent/:id" element={<PlaceholderPage title="Agent Detail" />} />

        {/* Onboarding flow */}
        <Route path="onboarding" element={<OnboardingLayout />}>
          <Route path="welcome" element={<PlaceholderPage title="Welcome" />} />
          <Route path="github-auth" element={<PlaceholderPage title="GitHub Auth" />} />
          <Route path="api-keys" element={<PlaceholderPage title="API Keys" />} />
          <Route path="create-project" element={<PlaceholderPage title="Create Project" />} />
          <Route path="complete" element={<PlaceholderPage title="Setup Complete" />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
