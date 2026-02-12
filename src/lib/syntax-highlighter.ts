/**
 * Lightweight regex-based syntax tokenizer for React Native.
 *
 * Supports TypeScript/JavaScript, JSON, Python, and Bash.
 * Uses brand colors: coral (keywords), teal (strings), gold (numbers).
 */

export type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'punctuation' | 'plain';

export interface Token {
  type: TokenType;
  value: string;
}

// Brand color mapping for token types
export const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#FF7059',   // coral-500
  string: '#14B8A6',    // teal-500
  comment: '#6B7280',   // neutral-500
  number: '#F5D563',    // gold-400
  operator: '#E5E7EB',  // neutral-200
  punctuation: '#9CA3AF', // neutral-400
  plain: '#D1D5DB',     // neutral-300
};

const JS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
  'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export',
  'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if',
  'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null',
  'of', 'package', 'private', 'protected', 'public', 'readonly', 'return', 'set',
  'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof',
  'undefined', 'var', 'void', 'while', 'with', 'yield',
]);

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
  'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case',
  'esac', 'function', 'return', 'exit', 'echo', 'export', 'local', 'readonly',
  'source', 'set', 'unset', 'shift', 'cd', 'pwd', 'eval', 'test',
  'true', 'false', 'in', 'select', 'until', 'break', 'continue',
]);

function getKeywords(language: string): Set<string> {
  const lang = language.toLowerCase();
  if (lang === 'python' || lang === 'py') return PYTHON_KEYWORDS;
  if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') return BASH_KEYWORDS;
  return JS_KEYWORDS;
}

function isJsonLike(language: string): boolean {
  const lang = language.toLowerCase();
  return lang === 'json' || lang === 'jsonc';
}

function isBashLike(language: string): boolean {
  const lang = language.toLowerCase();
  return lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh';
}

function isPythonLike(language: string): boolean {
  const lang = language.toLowerCase();
  return lang === 'python' || lang === 'py';
}

/**
 * Tokenize a line of code into typed tokens for syntax highlighting.
 */
function tokenizeLine(line: string, language: string): Token[] {
  if (!line) return [{ type: 'plain', value: '' }];

  const tokens: Token[] = [];
  const keywords = getKeywords(language);
  const isJson = isJsonLike(language);
  const isBash = isBashLike(language);
  const isPython = isPythonLike(language);

  // Build a combined regex pattern for all token types.
  // Order matters: comments first, then strings, numbers, identifiers, operators.
  const patterns: string[] = [];

  // Comments
  if (isJson) {
    patterns.push('(?:\\/\\/[^\n]*)');
  } else if (isBash || isPython) {
    patterns.push('(?:#[^\n]*)');
  } else {
    patterns.push('(?:\\/\\/[^\n]*)');
    patterns.push('(?:\\/\\*[\\s\\S]*?\\*\\/)');
  }

  // Strings (template literals, double-quoted, single-quoted)
  patterns.push("(?:`(?:[^`\\\\]|\\\\.)*`)");
  patterns.push('(?:"(?:[^"\\\\]|\\\\.)*")');
  patterns.push("(?:'(?:[^'\\\\]|\\\\.)*')");

  // Numbers (hex, binary, octal, float, int)
  patterns.push('(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\\d+\\.\\d*(?:[eE][+-]?\\d+)?|\\d+(?:[eE][+-]?\\d+)?|\\.\\d+(?:[eE][+-]?\\d+)?)');

  // Identifiers
  patterns.push('(?:[a-zA-Z_$][a-zA-Z0-9_$]*)');

  // Operators and punctuation
  patterns.push('(?:[{}()\\[\\];,.:?!<>=+\\-*/%&|^~@#]+)');

  // Whitespace
  patterns.push('(?:\\s+)');

  // Catch-all
  patterns.push('(?:.)');

  const regex = new RegExp(patterns.join('|'), 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const value = match[0];

    if (/^\s+$/.test(value)) {
      tokens.push({ type: 'plain', value });
      continue;
    }

    if (
      value.startsWith('//') || value.startsWith('/*') ||
      ((isBash || isPython) && value.startsWith('#'))
    ) {
      tokens.push({ type: 'comment', value });
    } else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('`') && value.endsWith('`'))
    ) {
      tokens.push({ type: 'string', value });
    } else if (/^(?:0[xXbBoO])?[\d]/.test(value) || /^\.\d/.test(value)) {
      tokens.push({ type: 'number', value });
    } else if (/^[a-zA-Z_$]/.test(value)) {
      if (!isJson && keywords.has(value)) {
        tokens.push({ type: 'keyword', value });
      } else {
        tokens.push({ type: 'plain', value });
      }
    } else if (/^[{}()\[\];,.:?!<>=+\-*/%&|^~@#]+$/.test(value)) {
      tokens.push({ type: 'punctuation', value });
    } else {
      tokens.push({ type: 'plain', value });
    }
  }

  return tokens.length > 0 ? tokens : [{ type: 'plain', value: line }];
}

/**
 * Tokenize source code into lines of tokens for rendering.
 */
export function tokenize(code: string, language: string): Token[][] {
  return code.split('\n').map((line) => tokenizeLine(line, language));
}
