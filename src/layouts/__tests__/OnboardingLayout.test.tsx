import { render, screen } from '@testing-library/react';
import { OnboardingLayout } from '../OnboardingLayout';

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Onboarding Content</div>,
}));

describe('OnboardingLayout', () => {
  it('renders Outlet', () => {
    render(<OnboardingLayout />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('has charcoal background and min-h-screen', () => {
    const { container } = render(<OnboardingLayout />);
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-charcoal');
  });
});
