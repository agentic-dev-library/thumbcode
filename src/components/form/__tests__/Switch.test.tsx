import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('renders with default props', () => {
    const { container } = render(<Switch value={false} onValueChange={vi.fn()} />);
    expect(container.querySelector('[role="switch"]')).toBeTruthy();
  });

  it('renders label text', () => {
    render(<Switch value={false} onValueChange={vi.fn()} label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeTruthy();
  });

  it('renders description text', () => {
    render(
      <Switch
        value={false}
        onValueChange={vi.fn()}
        label="Notifications"
        description="Enable push notifications"
      />
    );
    expect(screen.getByText('Enable push notifications')).toBeTruthy();
  });

  it('calls onValueChange with true when toggled on', () => {
    const onValueChange = vi.fn();
    render(<Switch value={false} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('calls onValueChange with false when toggled off', () => {
    const onValueChange = vi.fn();
    render(<Switch value={true} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('renders disabled state correctly', () => {
    render(<Switch value={false} onValueChange={vi.fn()} disabled />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
  });

  it('sets accessibility state correctly', () => {
    render(<Switch value={true} onValueChange={vi.fn()} disabled />);
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();
    expect(switchEl).toBeChecked();
  });
});
