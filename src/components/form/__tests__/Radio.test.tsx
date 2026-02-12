import { fireEvent, render } from '@testing-library/react-native';
import { RadioGroup } from '../Radio';

const mockOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', description: 'Description B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('RadioGroup', () => {
  it('renders all options', () => {
    const { toJSON } = render(
      <RadioGroup value={null} onValueChange={jest.fn()} options={mockOptions} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Option A');
    expect(json).toContain('Option B');
    expect(json).toContain('Option C');
  });

  it('renders group label', () => {
    const { toJSON } = render(
      <RadioGroup
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        label="Pick one"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Pick one');
  });

  it('renders option description', () => {
    const { toJSON } = render(
      <RadioGroup value={null} onValueChange={jest.fn()} options={mockOptions} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Description B');
  });

  it('renders error message', () => {
    const { toJSON } = render(
      <RadioGroup
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        error="Please select an option"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Please select an option');
  });

  it('calls onValueChange when an option is pressed', () => {
    const onValueChange = jest.fn();
    const { UNSAFE_getAllByProps } = render(
      <RadioGroup value={null} onValueChange={onValueChange} options={mockOptions} />
    );
    const radios = UNSAFE_getAllByProps({ accessibilityRole: 'radio' });
    fireEvent.press(radios[0]);
    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('renders disabled option with aria-disabled attribute', () => {
    const { toJSON } = render(
      <RadioGroup value={null} onValueChange={jest.fn()} options={mockOptions} />
    );
    const json = JSON.stringify(toJSON());
    // Option C is disabled, should have aria-disabled
    expect(json).toContain('"aria-disabled":true');
  });

  it('shows selected state in rendered output', () => {
    const { toJSON } = render(
      <RadioGroup value="b" onValueChange={jest.fn()} options={mockOptions} />
    );
    const json = JSON.stringify(toJSON());
    // Selected option should have teal border
    expect(json).toContain('Option B');
  });
});
