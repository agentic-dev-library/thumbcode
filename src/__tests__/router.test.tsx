import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../router';

// Mock all page components to avoid importing their heavy dependencies
vi.mock('@/layouts/OnboardingLayout', () => ({
  OnboardingLayout: () => <div data-testid="onboarding-layout" />,
}));
vi.mock('@/layouts/RootLayout', () => ({
  RootLayout: () => <div data-testid="root-layout" />,
}));
vi.mock('@/layouts/TabLayout', () => ({
  TabLayout: () => <div data-testid="tab-layout" />,
}));
vi.mock('@/pages/detail/AgentDetail', () => ({
  AgentDetail: () => <div>Agent Detail</div>,
}));
vi.mock('@/pages/detail/ProjectDetail', () => ({
  ProjectDetail: () => <div>Project Detail</div>,
}));
vi.mock('@/pages/NotFound', () => ({
  NotFoundPage: () => <div>Not Found</div>,
}));
vi.mock('@/pages/onboarding/api-keys', () => ({
  default: () => <div>API Keys</div>,
}));
vi.mock('@/pages/onboarding/complete', () => ({
  default: () => <div>Complete</div>,
}));
vi.mock('@/pages/onboarding/create-project', () => ({
  default: () => <div>Create Project</div>,
}));
vi.mock('@/pages/onboarding/github-auth', () => ({
  default: () => <div>GitHub Auth</div>,
}));
vi.mock('@/pages/onboarding/welcome', () => ({
  default: () => <div>Welcome</div>,
}));
vi.mock('@/pages/settings/AgentSettings', () => ({
  AgentSettings: () => <div>Agent Settings</div>,
}));
vi.mock('@/pages/settings/CredentialSettings', () => ({
  CredentialSettings: () => <div>Credential Settings</div>,
}));
vi.mock('@/pages/settings/EditorSettings', () => ({
  EditorSettings: () => <div>Editor Settings</div>,
}));
vi.mock('@/pages/settings/McpSettings', () => ({
  McpSettings: () => <div>MCP Settings</div>,
}));
vi.mock('@/pages/tabs/agents', () => ({
  default: () => <div>Agents</div>,
}));
vi.mock('@/pages/tabs/chat', () => ({
  default: () => <div>Chat</div>,
}));
vi.mock('@/pages/tabs/home', () => ({
  default: () => <div>Home</div>,
}));
vi.mock('@/pages/tabs/projects', () => ({
  default: () => <div>Projects</div>,
}));
vi.mock('@/pages/tabs/settings', () => ({
  default: () => <div>Settings</div>,
}));

describe('AppRoutes', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
