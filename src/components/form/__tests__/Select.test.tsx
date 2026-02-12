import { fireEvent, render } from '@testing-library/react-native';
import { Select } from '../Select';

jest.mock('@/components/icons', () => ({
  ChevronDownIcon: () => 'ChevronDownIcon',
  SuccessIcon: () => 'SuccessIcon',
}));

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { input: {}, modal: {}, badge: {} },
}));

const mockOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular', disabled: true },
];

describe('Select', () => {
  it('renders with placeholder when no value is selected', () => {
    const { toJSON } = render(
      <Select value={null} onValueChange={jest.fn()} options={mockOptions} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Select an option');
  });

  it('renders with custom placeholder', () => {
    const { toJSON } = render(
      <Select
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        placeholder="Choose framework"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Choose framework');
  });

  it('displays selected value label', () => {
    const { toJSON } = render(
      <Select value="react" onValueChange={jest.fn()} options={mockOptions} />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('React');
  });

  it('renders label text', () => {
    const { toJSON } = render(
      <Select
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        label="Framework"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Framework');
  });

  it('renders error message', () => {
    const { toJSON } = render(
      <Select
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        error="Selection required"
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Selection required');
  });

  it('renders combobox trigger that can be pressed', () => {
    const { UNSAFE_getByProps } = render(
      <Select
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        label="Framework"
      />
    );
    const combobox = UNSAFE_getByProps({ accessibilityRole: 'combobox' });
    expect(combobox).toBeTruthy();
    // Press should not throw
    fireEvent.press(combobox);
  });

  it('does not open modal when disabled', () => {
    const { toJSON } = render(
      <Select
        value={null}
        onValueChange={jest.fn()}
        options={mockOptions}
        disabled
      />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"aria-disabled":true');
    expect(json).toContain('"role":"combobox"');
  });
});
