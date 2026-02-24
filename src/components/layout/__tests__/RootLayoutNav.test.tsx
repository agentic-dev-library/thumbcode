import { render, screen } from '@testing-library/react';
import { RootLayoutNav } from '../RootLayoutNav';

const mockNavigate = vi.fn();
let mockLocation = { pathname: '/' };

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}));

const mockOnboarding = {
  isLoading: false,
  hasCompletedOnboarding: true,
};

vi.mock('@/contexts/onboarding', () => ({
  useOnboarding: () => mockOnboarding,
}));

describe('RootLayoutNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnboarding.isLoading = false;
    mockOnboarding.hasCompletedOnboarding = true;
    mockLocation = { pathname: '/' };
  });

  it('renders Outlet when loaded and onboarding complete', () => {
    render(<RootLayoutNav />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading', () => {
    mockOnboarding.isLoading = true;
    const { container } = render(<RootLayoutNav />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('navigates to onboarding when not completed', () => {
    mockOnboarding.hasCompletedOnboarding = false;
    render(<RootLayoutNav />);
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/welcome', { replace: true });
  });

  it('navigates to home when completed but on onboarding page', () => {
    mockOnboarding.hasCompletedOnboarding = true;
    mockLocation = { pathname: '/onboarding/welcome' };
    render(<RootLayoutNav />);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('does not navigate when loading', () => {
    mockOnboarding.isLoading = true;
    render(<RootLayoutNav />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
