import { render } from '@testing-library/react';
import CompleteScreen from '../complete';

// Mock onboarding context
vi.mock('@/contexts/onboarding', () => ({
  useOnboarding: () => ({
    isLoading: false,
    hasCompletedOnboarding: false,
    completeOnboarding: vi.fn(() => Promise.resolve()),
  }),
}));

describe('CompleteScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<CompleteScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays completion message', () => {
    const { toJSON } = render(<CompleteScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain("You're All Set");
    expect(tree).toContain('ThumbCode is ready');
  });

  it('shows capability list', () => {
    const { toJSON } = render(<CompleteScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('AI Agent Teams');
    expect(tree).toContain('Mobile Git');
    expect(tree).toContain('Real-time Chat');
    expect(tree).toContain('Progress Tracking');
  });

  it('shows Start Building CTA', () => {
    const { toJSON } = render(<CompleteScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Start Building');
  });
});
