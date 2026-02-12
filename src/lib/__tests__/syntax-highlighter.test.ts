import type { Token, TokenType } from '../syntax-highlighter';
import { TOKEN_COLORS, tokenize } from '../syntax-highlighter';

/** Helper to find first token of a given type */
function findToken(tokens: Token[], type: TokenType): Token | undefined {
  return tokens.find((t) => t.type === type);
}

describe('tokenize', () => {
  describe('TypeScript/JavaScript', () => {
    it('identifies keywords', () => {
      const lines = tokenize('const x = 5;', 'typescript');
      const tokens = lines[0];
      const constToken = tokens.find((t) => t.value === 'const');
      expect(constToken).toBeDefined();
      expect(constToken?.type).toBe('keyword');
    });

    it('identifies strings', () => {
      const lines = tokenize('const name = "hello";', 'typescript');
      const tokens = lines[0];
      const stringToken = findToken(tokens, 'string');
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe('"hello"');
    });

    it('identifies single-quoted strings', () => {
      const lines = tokenize("const x = 'world';", 'javascript');
      const tokens = lines[0];
      const stringToken = findToken(tokens, 'string');
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe("'world'");
    });

    it('identifies template literals', () => {
      const lines = tokenize('const msg = `hi`;', 'typescript');
      const tokens = lines[0];
      const stringToken = findToken(tokens, 'string');
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe('`hi`');
    });

    it('identifies numbers', () => {
      const lines = tokenize('const x = 42;', 'typescript');
      const tokens = lines[0];
      const numToken = findToken(tokens, 'number');
      expect(numToken).toBeDefined();
      expect(numToken?.value).toBe('42');
    });

    it('identifies hex numbers', () => {
      const lines = tokenize('const color = 0xFF00FF;', 'typescript');
      const tokens = lines[0];
      const numToken = findToken(tokens, 'number');
      expect(numToken).toBeDefined();
      expect(numToken?.value).toBe('0xFF00FF');
    });

    it('identifies line comments', () => {
      const lines = tokenize('// this is a comment', 'typescript');
      const tokens = lines[0];
      expect(tokens[0].type).toBe('comment');
      expect(tokens[0].value).toContain('this is a comment');
    });

    it('identifies punctuation', () => {
      const lines = tokenize('const arr = [];', 'typescript');
      const tokens = lines[0];
      const punctTokens = tokens.filter((t) => t.type === 'punctuation');
      expect(punctTokens.length).toBeGreaterThan(0);
    });

    it('identifies multiple keywords', () => {
      const lines = tokenize('if (true) return false;', 'typescript');
      const tokens = lines[0];
      const keywords = tokens.filter((t) => t.type === 'keyword');
      const keywordValues = keywords.map((t) => t.value);
      expect(keywordValues).toContain('if');
      expect(keywordValues).toContain('true');
      expect(keywordValues).toContain('return');
      expect(keywordValues).toContain('false');
    });

    it('identifies plain identifiers', () => {
      const lines = tokenize('const myVar = 1;', 'typescript');
      const tokens = lines[0];
      const plainToken = tokens.find((t) => t.value === 'myVar');
      expect(plainToken).toBeDefined();
      expect(plainToken?.type).toBe('plain');
    });
  });

  describe('JSON', () => {
    it('identifies strings as strings (not keywords)', () => {
      const lines = tokenize('{"key": "value"}', 'json');
      const tokens = lines[0];
      const stringTokens = tokens.filter((t) => t.type === 'string');
      expect(stringTokens.length).toBe(2);
    });

    it('identifies numbers', () => {
      const lines = tokenize('{"count": 42}', 'json');
      const tokens = lines[0];
      const numToken = findToken(tokens, 'number');
      expect(numToken).toBeDefined();
      expect(numToken?.value).toBe('42');
    });

    it('does not treat JSON keys as keywords', () => {
      const lines = tokenize('{"const": "value"}', 'json');
      const tokens = lines[0];
      const keywordTokens = tokens.filter((t) => t.type === 'keyword');
      expect(keywordTokens.length).toBe(0);
    });

    it('identifies punctuation', () => {
      const lines = tokenize('{"a": [1, 2]}', 'json');
      const tokens = lines[0];
      const punctTokens = tokens.filter((t) => t.type === 'punctuation');
      expect(punctTokens.length).toBeGreaterThan(0);
    });
  });

  describe('Python', () => {
    it('identifies Python keywords', () => {
      const lines = tokenize('def hello():', 'python');
      const tokens = lines[0];
      const defToken = tokens.find((t) => t.value === 'def');
      expect(defToken).toBeDefined();
      expect(defToken?.type).toBe('keyword');
    });

    it('identifies Python-specific keywords', () => {
      const lines = tokenize('if True and not False:', 'python');
      const tokens = lines[0];
      const keywords = tokens.filter((t) => t.type === 'keyword');
      const values = keywords.map((t) => t.value);
      expect(values).toContain('if');
      expect(values).toContain('True');
      expect(values).toContain('and');
      expect(values).toContain('not');
      expect(values).toContain('False');
    });

    it('identifies hash comments', () => {
      const lines = tokenize('# python comment', 'python');
      const tokens = lines[0];
      expect(tokens[0].type).toBe('comment');
    });

    it('also works with py alias', () => {
      const lines = tokenize('def foo(): pass', 'py');
      const tokens = lines[0];
      const defToken = tokens.find((t) => t.value === 'def');
      expect(defToken?.type).toBe('keyword');
    });
  });

  describe('Bash', () => {
    it('identifies bash keywords', () => {
      const lines = tokenize('if [ -f file ]; then echo "yes"; fi', 'bash');
      const tokens = lines[0];
      const keywords = tokens.filter((t) => t.type === 'keyword');
      const values = keywords.map((t) => t.value);
      expect(values).toContain('if');
      expect(values).toContain('then');
      expect(values).toContain('echo');
      expect(values).toContain('fi');
    });

    it('identifies hash comments', () => {
      const lines = tokenize('# bash comment', 'bash');
      const tokens = lines[0];
      expect(tokens[0].type).toBe('comment');
    });

    it('also works with sh alias', () => {
      const lines = tokenize('export PATH="/usr/bin"', 'sh');
      const tokens = lines[0];
      const exportToken = tokens.find((t) => t.value === 'export');
      expect(exportToken?.type).toBe('keyword');
    });
  });

  describe('multiline input', () => {
    it('splits code into lines', () => {
      const code = 'const a = 1;\nconst b = 2;';
      const lines = tokenize(code, 'typescript');
      expect(lines).toHaveLength(2);
    });

    it('handles empty lines', () => {
      const code = 'const a = 1;\n\nconst b = 2;';
      const lines = tokenize(code, 'typescript');
      expect(lines).toHaveLength(3);
      expect(lines[1]).toEqual([{ type: 'plain', value: '' }]);
    });
  });

  describe('TOKEN_COLORS', () => {
    it('has colors for all token types', () => {
      const types: TokenType[] = [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'punctuation',
        'plain',
      ];
      for (const type of types) {
        expect(TOKEN_COLORS[type]).toBeDefined();
        expect(TOKEN_COLORS[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });

    it('uses brand colors', () => {
      expect(TOKEN_COLORS.keyword).toBe('#FF7059'); // coral
      expect(TOKEN_COLORS.string).toBe('#14B8A6'); // teal
      expect(TOKEN_COLORS.number).toBe('#F5D563'); // gold
    });
  });
});
