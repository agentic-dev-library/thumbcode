import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  return (
    <StyledView
      className="bg-charcoal my-2 p-3 shadow-organic-card"
      style={{
        borderRadius: '0.5rem 0.75rem 0.625rem 0.5rem',
      }}
    >
      {language && (
        <StyledText className="text-neutral-400 font-mono text-xs mb-2">
          {language}
        </StyledText>
      )}
      <StyledScrollView horizontal showsHorizontalScrollIndicator={false}>
        <StyledText className="text-neutral-50 font-mono text-sm">
          {code}
        </StyledText>
      </StyledScrollView>
    </StyledView>
  );
};

export default CodeBlock;
