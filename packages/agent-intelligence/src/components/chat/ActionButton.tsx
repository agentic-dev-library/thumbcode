// packages/agent-intelligence/src/components/chat/ActionButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
}

const ActionButton = ({ title, onPress }: ActionButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F5D563',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  text: {
    color: '#151820',
    fontWeight: 'bold',
  },
});

export default ActionButton;
