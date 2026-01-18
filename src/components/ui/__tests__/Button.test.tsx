import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ActivityIndicator, Pressable } from 'react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);
    const buttonText = screen.getByText('Test Button');
    expect(buttonText).toBeDefined();
  });

  describe('variants', () => {
    it('renders primary variant', () => {
      const { getByText } = render(<Button variant="primary">Primary</Button>);
      expect(getByText('Primary')).toBeDefined();
    });

    it('renders secondary variant', () => {
      const { getByText } = render(<Button variant="secondary">Secondary</Button>);
      expect(getByText('Secondary')).toBeDefined();
    });

    it('renders outline variant', () => {
      const { getByText } = render(<Button variant="outline">Outline</Button>);
      expect(getByText('Outline')).toBeDefined();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      const { getByText } = render(<Button size="sm">Small</Button>);
      expect(getByText('Small')).toBeDefined();
    });

    it('renders medium size', () => {
      const { getByText } = render(<Button size="md">Medium</Button>);
      expect(getByText('Medium')).toBeDefined();
    });

    it('renders large size', () => {
      const { getByText } = render(<Button size="lg">Large</Button>);
      expect(getByText('Large')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('shows activity indicator when loading', () => {
      const { queryByText, UNSAFE_getByType } = render(
        <Button loading>Loading</Button>
      );
      // Text should not be visible
      expect(queryByText('Loading')).toBeNull();
      // ActivityIndicator should be present
      expect(UNSAFE_getByType(ActivityIndicator)).toBeDefined();
    });

    it('disables interaction when loading', () => {
      const onPress = jest.fn();
      const { UNSAFE_getByType } = render(
        <Button loading onPress={onPress}>Loading</Button>
      );
      const button = UNSAFE_getByType(Pressable);
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('disables interaction when disabled prop is true', () => {
      const onPress = jest.fn();
      const { UNSAFE_getByType } = render(
        <Button disabled onPress={onPress}>Disabled</Button>
      );
      const button = UNSAFE_getByType(Pressable);
      expect(button.props.disabled).toBe(true);
    });
  });
});
