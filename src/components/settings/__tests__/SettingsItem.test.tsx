import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsItem } from '../SettingsItem';

vi.mock('@/components/display', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/components/icons', () => ({}));

vi.mock('@/components/layout', () => ({
  HStack: ({ children }: any) => <div>{children}</div>,
  VStack: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children }: any) => <span>{children}</span>,
}));

const MockIcon = ({ size, color }: any) => <span data-testid="icon">icon</span>;

describe('SettingsItem', () => {
  it('renders title and icon', () => {
    render(<SettingsItem Icon={MockIcon} title="Theme" />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<SettingsItem Icon={MockIcon} title="Theme" subtitle="Choose your theme" />);
    expect(screen.getByText('Choose your theme')).toBeInTheDocument();
  });

  it('renders value when provided', () => {
    render(<SettingsItem Icon={MockIcon} title="Version" value="1.0.0" />);
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<SettingsItem Icon={MockIcon} title="Feature" badge="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(<SettingsItem Icon={MockIcon} title="Theme" onPress={onPress} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('renders toggle checkbox when toggle prop provided', () => {
    const onValueChange = vi.fn();
    render(
      <SettingsItem Icon={MockIcon} title="Dark Mode" toggle={{ value: true, onValueChange }} />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(onValueChange).toHaveBeenCalled();
  });

  it('hides arrow when showArrow is false', () => {
    render(<SettingsItem Icon={MockIcon} title="Theme" showArrow={false} />);
    expect(screen.queryByText('\u203A')).not.toBeInTheDocument();
  });

  it('hides arrow when toggle is present', () => {
    render(
      <SettingsItem
        Icon={MockIcon}
        title="Toggle"
        toggle={{ value: false, onValueChange: vi.fn() }}
      />
    );
    expect(screen.queryByText('\u203A')).not.toBeInTheDocument();
  });
});
