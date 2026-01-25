import React from 'react';
import { create } from 'react-test-renderer';
import { Avatar } from '../Avatar';
import { Text } from 'react-native';

describe('Avatar', () => {
  it('renders correct initials for full name', () => {
    const tree = create(<Avatar name="John Doe" />).root;
    const textComponent = tree.findByType(Text);
    expect(textComponent.props.children).toBe('JD');
  });

  it('renders correct initials for single name', () => {
    const tree = create(<Avatar name="Alice" />).root;
    const textComponent = tree.findByType(Text);
    expect(textComponent.props.children).toBe('A');
  });

  it('renders correct initials for three names', () => {
    const tree = create(<Avatar name="John Robert Doe" />).root;
    const textComponent = tree.findByType(Text);
    expect(textComponent.props.children).toBe('JR');
  });

  it('handles empty name', () => {
    const tree = create(<Avatar name="" />).root;
    const textComponent = tree.findByType(Text);
    expect(textComponent.props.children).toBe('');
  });

  it('updates initials when name changes', () => {
     const component = create(<Avatar name="John Doe" />);
     let textComponent = component.root.findByType(Text);
     expect(textComponent.props.children).toBe('JD');

     component.update(<Avatar name="Jane Smith" />);
     textComponent = component.root.findByType(Text);
     expect(textComponent.props.children).toBe('JS');
  });
});
