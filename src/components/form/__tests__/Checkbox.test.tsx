import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    const { container } = render(<Checkbox checked={false} onCheckedChange={vi.fn()} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders checked state with check icon', () => {
    const { container } = render(<Checkbox checked={true} onCheckedChange={vi.fn()} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders label text', () => {
    render(<Checkbox checked={false} onCheckedChange={vi.fn()} label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeTruthy();
  });

  it('renders description text', () => {
    render(
      <Checkbox
        checked={false}
        onCheckedChange={vi.fn()}
        label="Notifications"
        description="Receive email notifications"
      />
    );
    expect(screen.getByText('Receive email notifications')).toBeTruthy();
  });

  it('calls onCheckedChange with toggled value when pressed', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with false when checked checkbox is pressed', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={true} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('renders disabled state correctly', () => {
    render(<Checkbox checked={false} onCheckedChange={vi.fn()} disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('sets accessibility state correctly', () => {
    render(<Checkbox checked={true} onCheckedChange={vi.fn()} disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox).toBeChecked();
  });
});
