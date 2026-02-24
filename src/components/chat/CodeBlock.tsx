/**
 * Code Block Component
 *
 * Renders code snippets with syntax highlighting and copy functionality.
 * Uses JetBrains Mono font per brand guidelines with brand-colored tokens.
 */

import { useMemo, useState } from 'react';
import { Text } from '@/components/ui';
import { TOKEN_COLORS, tokenize } from '@/lib/syntax-highlighter';

/** Props for the CodeBlock component */
interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Optional filename shown in the header */
  filename?: string;
}

export function CodeBlock({ code, language, filename }: Readonly<CodeBlockProps>) {
  const [copied, setCopied] = useState(false);

  const tokenizedLines = useMemo(() => tokenize(code, language), [code, language]);

  const handleCopy = async () => {
    // In React Native, we'd use Clipboard API
    // For now, just show feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-charcoal overflow-hidden rounded-organic-code">
      {/* Header with language and filename */}
      <div className="flex flex-row justify-between items-center px-3 py-2 bg-neutral-800 border-b border-neutral-700">
        <div className="flex flex-row items-center">
          <Text variant="mono" size="xs" className="text-neutral-400">
            {language}
          </Text>
          {filename && (
            <>
              <Text size="xs" className="text-neutral-600 mx-2">
                •
              </Text>
              <Text variant="mono" size="xs" className="text-neutral-300">
                {filename}
              </Text>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-1 active:bg-neutral-700 rounded-organic-badge"
          aria-label="Copy code"
          aria-description="Copy the code to the clipboard"
        >
          <Text size="xs" className="text-neutral-400">
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </button>
      </div>

      {/* Code content with syntax highlighting */}
      <div>
        <div className="p-3">
          {tokenizedLines.map((lineTokens, lineIndex) => (
            <Text
              key={`L${lineIndex}:${lineTokens[0]?.value.slice(0, 8)}`}
              variant="mono"
              size="sm"
              style={{ lineHeight: 20 }}
            >
              {lineTokens.map((token, tokenIndex) => (
                <Text
                  key={`${tokenIndex}:${token.type}:${token.value.slice(0, 12)}`}
                  variant="mono"
                  size="sm"
                  style={{ color: TOKEN_COLORS[token.type] }}
                >
                  {token.value}
                </Text>
              ))}
              {'\n'}
            </Text>
          ))}
        </div>
      </div>
    </div>
  );
}
