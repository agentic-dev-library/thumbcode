import { fireEvent, render, screen } from '@testing-library/react';
import { DeviceCodeDisplay } from '../DeviceCodeDisplay';

vi.mock('@/components/icons', () => ({
  LinkIcon: () => <span data-testid="link-icon" />,
}));

vi.mock('@/components/layout', () => ({
  VStack: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe('DeviceCodeDisplay', () => {
  const defaultProps = {
    userCode: null as string | null,
    isAuthenticating: false,
    onStartDeviceFlow: vi.fn(),
    onOpenGitHub: vi.fn(),
    onCheckAuth: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  describe('without userCode', () => {
    it('renders the start authentication button', () => {
      render(<DeviceCodeDisplay {...defaultProps} />);
      expect(screen.getByText('Start GitHub Authentication')).toBeInTheDocument();
    });

    it('shows secure device flow description', () => {
      render(<DeviceCodeDisplay {...defaultProps} />);
      expect(screen.getByText('Secure Device Flow')).toBeInTheDocument();
    });

    it('calls onStartDeviceFlow when button is clicked', () => {
      render(<DeviceCodeDisplay {...defaultProps} />);
      fireEvent.click(screen.getByText('Start GitHub Authentication'));
      expect(defaultProps.onStartDeviceFlow).toHaveBeenCalledOnce();
    });

    it('disables button when authenticating', () => {
      render(<DeviceCodeDisplay {...defaultProps} isAuthenticating={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows spinner when authenticating', () => {
      const { container } = render(<DeviceCodeDisplay {...defaultProps} isAuthenticating={true} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('with userCode', () => {
    const propsWithCode = { ...defaultProps, userCode: 'ABCD-1234' };

    it('renders the user code', () => {
      render(<DeviceCodeDisplay {...propsWithCode} />);
      expect(screen.getByText('ABCD-1234')).toBeInTheDocument();
    });

    it('shows instruction text', () => {
      render(<DeviceCodeDisplay {...propsWithCode} />);
      expect(screen.getByText('Enter this code on GitHub:')).toBeInTheDocument();
    });

    it('calls onOpenGitHub when open button clicked', () => {
      render(<DeviceCodeDisplay {...propsWithCode} />);
      fireEvent.click(screen.getByText('Open GitHub →'));
      expect(propsWithCode.onOpenGitHub).toHaveBeenCalledOnce();
    });

    it('calls onCheckAuth when check button clicked', () => {
      render(<DeviceCodeDisplay {...propsWithCode} />);
      fireEvent.click(screen.getByText("I've Entered the Code"));
      expect(propsWithCode.onCheckAuth).toHaveBeenCalledOnce();
    });

    it('disables check button when authenticating', () => {
      render(<DeviceCodeDisplay {...propsWithCode} isAuthenticating={true} />);
      const buttons = screen.getAllByRole('button');
      const checkBtn = buttons.find((b) => b.classList.contains('bg-teal-600'));
      expect(checkBtn).toBeDisabled();
    });
  });
});
