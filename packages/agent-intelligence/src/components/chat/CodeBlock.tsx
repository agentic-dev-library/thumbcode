// packages/agent-intelligence/src/components/chat/CodeBlock.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CodeBlock = ({ code }: { code: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>{code}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#151820',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  code: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
});

export default CodeBlock;
