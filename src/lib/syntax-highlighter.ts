/**
 * Lightweight regex-based syntax tokenizer for React Native.
 *
 * Supports TypeScript/JavaScript, JSON, Python, and Bash.
 * Uses brand colors: coral (keywords), teal (strings), gold (numbers).
 */

export type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'operator'
  | 'punctuation'
  | 'plain';

export interface Token {
  type: TokenType;
  value: string;
}

// Brand color mapping for token types
export const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#FF7059', // coral-500
  string: '#14B8A6', // teal-500
  comment: '#6B7280', // neutral-500
  number: '#F5D563', // gold-400
  operator: '#E5E7EB', // neutral-200
  punctuation: '#9CA3AF', // neutral-400
  plain: '#D1D5DB', // neutral-300
};

const JS_KEYWORDS = new Set([
  'abstract',
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'get',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'return',
  'set',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

const PYTHON_KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
]);

const BASH_KEYWORDS = new Set([
  'if',
  'then',
  'else',
  'elif',
  'fi',
  'for',
  'while',
  'do',
  'done',
  'case',
  'esac',
  'function',
  'return',
  'exit',
  'echo',
  'export',
  'local',
  'readonly',
  'source',
  'set',
  'unset',
  'shift',
  'cd',
  'pwd',
  'eval',
  'test',
  'true',
  'false',
  'in',
  'select',
  'until',
  'break',
  'continue',
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

function buildCommentPatterns(isJson: boolean, isBash: boolean, isPython: boolean): string[] {
  if (isJson) return ['(?:\\/\\/[^\n]*)'];
  if (isBash || isPython) return ['(?:#[^\n]*)'];
  return ['(?:\\/\\/[^\n]*)', '(?:\\/\\*[\\s\\S]*?\\*\\/)'];
}

function buildTokenRegex(isJson: boolean, isBash: boolean, isPython: boolean): RegExp {
  const patterns: string[] = [
    ...buildCommentPatterns(isJson, isBash, isPython),
    '(?:`(?:[^`\\\\]|\\\\.)*`)',
    '(?:"(?:[^"\\\\]|\\\\.)*")',
    "(?:'(?:[^'\\\\]|\\\\.)*')",
    '(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\\d+\\.\\d*(?:[eE][+-]?\\d+)?|\\d+(?:[eE][+-]?\\d+)?|\\.\\d+(?:[eE][+-]?\\d+)?)',
    '(?:[a-zA-Z_$][a-zA-Z0-9_$]*)',
    '(?:[{}()\\[\\];,.:?!<>=+\\-*/%&|^~@#]+)',
    '(?:\\s+)',
    '(?:.)',
  ];
  return new RegExp(patterns.join('|'), 'g');
}

function isQuotedString(value: string): boolean {
  const first = value[0];
  const last = value[value.length - 1];
  return (first === '"' || first === "'" || first === '`') && first === last;
}

function isComment(value: string, hasHashComments: boolean): boolean {
  if (value.startsWith('//') || value.startsWith('/*')) return true;
  return hasHashComments && value.startsWith('#');
}

function classifyToken(
  value: string,
  keywords: Set<string>,
  isJson: boolean,
  hasHashComments: boolean
): TokenType {
  if (/^\s+$/.test(value)) return 'plain';
  if (isComment(value, hasHashComments)) return 'comment';
  if (isQuotedString(value)) return 'string';
  if (/^(?:0[xXbBoO])?[\d]/.test(value) || /^\.\d/.test(value)) return 'number';

  if (/^[a-zA-Z_$]/.test(value)) {
    return !isJson && keywords.has(value) ? 'keyword' : 'plain';
  }

  if (/^[{}()[\];,.:?!<>=+\-*/%&|^~@#]+$/.test(value)) return 'punctuation';

  return 'plain';
}

/**
 * Tokenize a line of code into typed tokens for syntax highlighting.
 */
function tokenizeLine(line: string, language: string): Token[] {
  if (!line) return [{ type: 'plain', value: '' }];

  const keywords = getKeywords(language);
  const isJson = isJsonLike(language);
  const isBash = isBashLike(language);
  const isPython = isPythonLike(language);
  const hasHashComments = isBash || isPython;

  const regex = buildTokenRegex(isJson, isBash, isPython);
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((match = regex.exec(line)) !== null) {
    const value = match[0];
    tokens.push({ type: classifyToken(value, keywords, isJson, hasHashComments), value });
  }

  return tokens.length > 0 ? tokens : [{ type: 'plain', value: line }];
}

/**
 * Tokenize source code into lines of tokens for rendering.
 */
export function tokenize(code: string, language: string): Token[][] {
  return code.split('\n').map((line) => tokenizeLine(line, language));
}
