/**
 * Code Block Component
 *
 * Renders code snippets with syntax highlighting placeholder and copy functionality.
 * Uses JetBrains Mono font per brand guidelines.
 */

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // In React Native, we'd use Clipboard API
    // For now, just show feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className="bg-charcoal overflow-hidden" style={{ borderRadius: '12px 8px 12px 10px' }}>
      {/* Header with language and filename */}
      <View className="flex-row justify-between items-center px-3 py-2 bg-neutral-800 border-b border-neutral-700">
        <View className="flex-row items-center">
          <Text className="text-xs font-mono text-neutral-400">{language}</Text>
          {filename && (
            <>
              <Text className="text-xs text-neutral-600 mx-2">•</Text>
              <Text className="text-xs font-mono text-neutral-300">{filename}</Text>
            </>
          )}
        </View>
        <Pressable
          onPress={handleCopy}
          className="px-2 py-1 active:bg-neutral-700"
          style={{ borderRadius: '4px 6px 4px 6px' }}
        >
          <Text className="text-xs font-body text-neutral-400">{copied ? 'Copied!' : 'Copy'}</Text>
        </Pressable>
      </View>

      {/* Code content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="p-3">
          <Text className="font-mono text-sm text-neutral-200" style={{ lineHeight: 20 }}>
            {code}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
