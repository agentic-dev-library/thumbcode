import { fireEvent, render, screen } from '@testing-library/react';
import { ApiKeyInput, CredentialItem } from '../CredentialSection';

vi.mock('@/components/display', () => ({
  Badge: ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/components/icons', () => ({}));

vi.mock('@/components/layout', () => ({
  HStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

const MockIcon = () => <span data-testid="icon">icon</span>;

describe('CredentialItem', () => {
  const baseProps = {
    Icon: MockIcon,
    title: 'GitHub',
    subtitle: 'Connect your GitHub account',
    isConnected: false,
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and subtitle', () => {
    render(<CredentialItem {...baseProps} />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Connect your GitHub account')).toBeInTheDocument();
  });

  it('shows Connect button when not connected', () => {
    render(<CredentialItem {...baseProps} />);
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('shows Remove button and Connected badge when connected', () => {
    render(<CredentialItem {...baseProps} isConnected lastUsed="2024-01-01" />);
    expect(screen.getByText('Remove')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText(/Last used/)).toBeInTheDocument();
  });

  it('calls onConnect when Connect button clicked', () => {
    render(<CredentialItem {...baseProps} />);
    fireEvent.click(screen.getByText('Connect'));
    expect(baseProps.onConnect).toHaveBeenCalledOnce();
  });

  it('calls onDisconnect when Remove button clicked', () => {
    render(<CredentialItem {...baseProps} isConnected />);
    fireEvent.click(screen.getByText('Remove'));
    expect(baseProps.onDisconnect).toHaveBeenCalledOnce();
  });
});

describe('ApiKeyInput', () => {
  const baseProps = {
    label: 'API Key',
    placeholder: 'Enter key...',
    value: '',
    onChange: vi.fn(),
    onSave: vi.fn(),
    isSet: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label', () => {
    render(<ApiKeyInput {...baseProps} />);
    expect(screen.getByText('API Key')).toBeInTheDocument();
  });

  it('shows input when key is not set', () => {
    render(<ApiKeyInput {...baseProps} />);
    expect(screen.getByPlaceholderText('Enter key...')).toBeInTheDocument();
  });

  it('shows masked value when key is set and not editing', () => {
    render(<ApiKeyInput {...baseProps} isSet />);
    expect(screen.getByText(/Set/)).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    render(<ApiKeyInput {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText('Enter key...'), {
      target: { value: 'sk-test' },
    });
    expect(baseProps.onChange).toHaveBeenCalledWith('sk-test');
  });

  it('shows error message when error provided', () => {
    render(<ApiKeyInput {...baseProps} error="Invalid key" />);
    expect(screen.getByText('Invalid key')).toBeInTheDocument();
  });

  it('calls onSave when save button clicked with value', () => {
    render(<ApiKeyInput {...baseProps} value="sk-test-key" />);
    fireEvent.click(screen.getByText('Save'));
    expect(baseProps.onSave).toHaveBeenCalledOnce();
  });

  it('does not call onSave when value is empty', () => {
    render(<ApiKeyInput {...baseProps} value="   " />);
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    expect(baseProps.onSave).not.toHaveBeenCalled();
  });
});
