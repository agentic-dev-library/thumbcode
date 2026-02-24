import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { RootLayout } from '@/layouts/RootLayout';
import { TabLayout } from '@/layouts/TabLayout';

const HomePage = lazy(() => import('@/pages/tabs/home'));
const ProjectsPage = lazy(() => import('@/pages/tabs/projects'));
const AgentsPage = lazy(() => import('@/pages/tabs/agents'));
const ChatPage = lazy(() => import('@/pages/tabs/chat'));
const SettingsPage = lazy(() => import('@/pages/tabs/settings'));
const AgentDetail = lazy(() =>
  import('@/pages/detail/AgentDetail').then((m) => ({ default: m.AgentDetail }))
);
const ProjectDetail = lazy(() =>
  import('@/pages/detail/ProjectDetail').then((m) => ({ default: m.ProjectDetail }))
);
const WelcomePage = lazy(() => import('@/pages/onboarding/welcome'));
const GitHubAuthPage = lazy(() => import('@/pages/onboarding/github-auth'));
const ApiKeysPage = lazy(() => import('@/pages/onboarding/api-keys'));
const CreateProjectPage = lazy(() => import('@/pages/onboarding/create-project'));
const CompletePage = lazy(() => import('@/pages/onboarding/complete'));
const AgentSettings = lazy(() =>
  import('@/pages/settings/AgentSettings').then((m) => ({ default: m.AgentSettings }))
);
const CredentialSettings = lazy(() =>
  import('@/pages/settings/CredentialSettings').then((m) => ({ default: m.CredentialSettings }))
);
const EditorSettings = lazy(() =>
  import('@/pages/settings/EditorSettings').then((m) => ({ default: m.EditorSettings }))
);
const McpSettings = lazy(() =>
  import('@/pages/settings/McpSettings').then((m) => ({ default: m.McpSettings }))
);
const ProviderConfig = lazy(() =>
  import('@/pages/settings/ProviderConfig').then((m) => ({ default: m.ProviderConfig }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFoundPage }))
);

function PageLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-charcoal min-h-screen">
      <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route
            element={
              <ErrorBoundary>
                <TabLayout />
              </ErrorBoundary>
            }
          >
            <Route
              index
              element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              }
            />
            <Route
              path="projects"
              element={
                <ErrorBoundary>
                  <ProjectsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="agents"
              element={
                <ErrorBoundary>
                  <AgentsPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="chat"
              element={
                <ErrorBoundary>
                  <ChatPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="settings"
              element={
                <ErrorBoundary>
                  <SettingsPage />
                </ErrorBoundary>
              }
            />
          </Route>

          <Route
            path="settings/agents"
            element={
              <ErrorBoundary>
                <AgentSettings />
              </ErrorBoundary>
            }
          />
          <Route
            path="settings/credentials"
            element={
              <ErrorBoundary>
                <CredentialSettings />
              </ErrorBoundary>
            }
          />
          <Route
            path="settings/editor"
            element={
              <ErrorBoundary>
                <EditorSettings />
              </ErrorBoundary>
            }
          />
          <Route
            path="settings/mcp"
            element={
              <ErrorBoundary>
                <McpSettings />
              </ErrorBoundary>
            }
          />
          <Route
            path="settings/providers"
            element={
              <ErrorBoundary>
                <ProviderConfig />
              </ErrorBoundary>
            }
          />

          <Route
            path="project/:id"
            element={
              <ErrorBoundary>
                <ProjectDetail />
              </ErrorBoundary>
            }
          />
          <Route
            path="agent/:id"
            element={
              <ErrorBoundary>
                <AgentDetail />
              </ErrorBoundary>
            }
          />

          <Route
            path="onboarding"
            element={
              <ErrorBoundary>
                <OnboardingLayout />
              </ErrorBoundary>
            }
          >
            <Route path="welcome" element={<WelcomePage />} />
            <Route path="github-auth" element={<GitHubAuthPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="create-project" element={<CreateProjectPage />} />
            <Route path="complete" element={<CompletePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
