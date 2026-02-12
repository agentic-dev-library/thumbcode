import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders children', () => {
    const { toJSON } = render(
      <FormField>
        <Text>Child content</Text>
      </FormField>
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Child content');
  });

  it('renders label text', () => {
    const { toJSON } = render(
      <FormField label="Email">
        <Text>Input</Text>
      </FormField>
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Email');
  });

  it('renders required indicator', () => {
    const { toJSON } = render(
      <FormField label="Email" required>
        <Text>Input</Text>
      </FormField>
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('*');
  });

  it('renders helper text', () => {
    const { toJSON } = render(
      <FormField helper="We will never share your email">
        <Text>Input</Text>
      </FormField>
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('We will never share your email');
  });

  it('renders error text instead of helper when error is set', () => {
    const { toJSON } = render(
      <FormField helper="Enter a valid email" error="Invalid email address">
        <Text>Input</Text>
      </FormField>
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Invalid email address');
  });

  it('renders labelRight content', () => {
    const { toJSON } = render(
      <FormField label="Password" labelRight={<Text>Forgot?</Text>}>
        <Text>Input</Text>
      </FormField>
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Forgot?');
  });
});
