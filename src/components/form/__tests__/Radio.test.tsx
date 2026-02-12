import { fireEvent, render, screen } from '@testing-library/react';
import { RadioGroup } from '../Radio';

const mockOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', description: 'Description B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('RadioGroup', () => {
  it('renders all options', () => {
    render(<RadioGroup value={null} onValueChange={vi.fn()} options={mockOptions} />);
    expect(screen.getByText('Option A')).toBeTruthy();
    expect(screen.getByText('Option B')).toBeTruthy();
    expect(screen.getByText('Option C')).toBeTruthy();
  });

  it('renders group label', () => {
    render(
      <RadioGroup value={null} onValueChange={vi.fn()} options={mockOptions} label="Pick one" />
    );
    expect(screen.getByText('Pick one')).toBeTruthy();
  });

  it('renders option description', () => {
    render(<RadioGroup value={null} onValueChange={vi.fn()} options={mockOptions} />);
    expect(screen.getByText('Description B')).toBeTruthy();
  });

  it('renders error message', () => {
    render(
      <RadioGroup
        value={null}
        onValueChange={vi.fn()}
        options={mockOptions}
        error="Please select an option"
      />
    );
    expect(screen.getByText('Please select an option')).toBeTruthy();
  });

  it('calls onValueChange when an option is pressed', () => {
    const onValueChange = vi.fn();
    render(<RadioGroup value={null} onValueChange={onValueChange} options={mockOptions} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('renders disabled option correctly', () => {
    render(<RadioGroup value={null} onValueChange={vi.fn()} options={mockOptions} />);
    const radios = screen.getAllByRole('radio');
    // Option C (index 2) is disabled
    expect(radios[2]).toBeDisabled();
  });

  it('shows selected state', () => {
    render(<RadioGroup value="b" onValueChange={vi.fn()} options={mockOptions} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toBeChecked();
  });
});
