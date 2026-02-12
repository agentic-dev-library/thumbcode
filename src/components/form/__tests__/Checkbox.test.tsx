import { fireEvent, render } from '@testing-library/react';
import { Checkbox } from '../Checkbox';

vi.mock('@/components/icons', () => ({
  SuccessIcon: () => 'SuccessIcon',
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { badge: {} },
}));

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    const { toJSON } = render(<Checkbox checked={false} onCheckedChange={vi.fn()} />);
    const json = JSON.stringify(toJSON());
    expect(json).toBeTruthy();
    expect(json).not.toContain('SuccessIcon');
  });

  it('renders checked state with check icon', () => {
    const { toJSON } = render(<Checkbox checked={true} onCheckedChange={vi.fn()} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('SuccessIcon');
  });

  it('renders label text', () => {
    const { toJSON } = render(
      <Checkbox checked={false} onCheckedChange={vi.fn()} label="Accept terms" />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Accept terms');
  });

  it('renders description text', () => {
    const { toJSON } = render(
      <Checkbox
        checked={false}
        onCheckedChange={vi.fn()}
        label="Notifications"
        description="Receive email notifications"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Receive email notifications');
  });

  it('calls onCheckedChange with toggled value when pressed', () => {
    const onCheckedChange = vi.fn();
    const { UNSAFE_getByProps } = render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} />
    );
    fireEvent.click(UNSAFE_getByProps({ accessibilityRole: 'checkbox' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with false when checked checkbox is pressed', () => {
    const onCheckedChange = vi.fn();
    const { UNSAFE_getByProps } = render(
      <Checkbox checked={true} onCheckedChange={onCheckedChange} />
    );
    fireEvent.click(UNSAFE_getByProps({ accessibilityRole: 'checkbox' }));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('does not call onCheckedChange when disabled', () => {
    const onCheckedChange = vi.fn();
    const { UNSAFE_getByProps } = render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} disabled />
    );
    fireEvent.click(UNSAFE_getByProps({ accessibilityRole: 'checkbox' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('sets accessibility state correctly', () => {
    const { toJSON } = render(<Checkbox checked={true} onCheckedChange={vi.fn()} disabled />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"aria-disabled":true');
    expect(json).toContain('"role":"checkbox"');
  });
});
