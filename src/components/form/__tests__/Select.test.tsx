import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from '../Select';

const mockOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular', disabled: true },
];

describe('Select', () => {
  it('renders with placeholder when no value is selected', () => {
    render(<Select value={null} onValueChange={vi.fn()} options={mockOptions} />);
    expect(screen.getByText('Select an option')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    render(
      <Select
        value={null}
        onValueChange={vi.fn()}
        options={mockOptions}
        placeholder="Choose framework"
      />
    );
    expect(screen.getByText('Choose framework')).toBeTruthy();
  });

  it('displays all options', () => {
    render(<Select value="react" onValueChange={vi.fn()} options={mockOptions} />);
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText('Vue')).toBeTruthy();
    expect(screen.getByText('Angular')).toBeTruthy();
  });

  it('renders label text', () => {
    render(<Select value={null} onValueChange={vi.fn()} options={mockOptions} label="Framework" />);
    expect(screen.getByText('Framework')).toBeTruthy();
  });

  it('renders error message', () => {
    render(
      <Select
        value={null}
        onValueChange={vi.fn()}
        options={mockOptions}
        error="Selection required"
      />
    );
    expect(screen.getByText('Selection required')).toBeTruthy();
  });

  it('calls onValueChange when option is selected', () => {
    const onValueChange = vi.fn();
    render(<Select value={null} onValueChange={onValueChange} options={mockOptions} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'vue' } });
    expect(onValueChange).toHaveBeenCalledWith('vue');
  });

  it('renders disabled state correctly', () => {
    render(<Select value={null} onValueChange={vi.fn()} options={mockOptions} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
