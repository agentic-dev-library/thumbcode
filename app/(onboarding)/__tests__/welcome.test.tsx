import { render } from '@testing-library/react';
import WelcomeScreen from '../welcome';

describe('WelcomeScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<WelcomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays ThumbCode branding', () => {
    const { toJSON } = render(<WelcomeScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('ThumbCode');
    expect(tree).toContain('Code with your thumbs');
  });

  it('shows feature list', () => {
    const { toJSON } = render(<WelcomeScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('AI Agent Teams');
    expect(tree).toContain('Mobile-First Git');
    expect(tree).toContain('Your Keys, Your Control');
    expect(tree).toContain('Zero Server Costs');
  });

  it('shows Get Started CTA', () => {
    const { toJSON } = render(<WelcomeScreen />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Get Started');
  });
});
