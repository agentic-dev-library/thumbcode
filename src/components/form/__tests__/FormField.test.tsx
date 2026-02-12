import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders children', () => {
    render(
      <FormField>
        <span>Child content</span>
      </FormField>
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('renders label text', () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('renders required indicator', () => {
    render(
      <FormField label="Email" required>
        <input />
      </FormField>
    );
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders helper text', () => {
    render(
      <FormField helper="We will never share your email">
        <input />
      </FormField>
    );
    expect(screen.getByText('We will never share your email')).toBeTruthy();
  });

  it('renders error text instead of helper when error is set', () => {
    render(
      <FormField helper="Enter a valid email" error="Invalid email address">
        <input />
      </FormField>
    );
    expect(screen.getByText('Invalid email address')).toBeTruthy();
  });

  it('renders labelRight content', () => {
    render(
      <FormField label="Password" labelRight={<span>Forgot?</span>}>
        <input />
      </FormField>
    );
    expect(screen.getByText('Forgot?')).toBeTruthy();
  });
});
