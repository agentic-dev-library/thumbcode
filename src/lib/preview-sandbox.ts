/**
 * Preview Sandbox Utility
 *
 * Creates self-contained HTML documents for iframe preview of components.
 * Includes Tailwind CDN configured with ThumbCode design tokens,
 * Google Fonts, and basic XSS sanitization.
 */

/** Configuration for preview HTML generation */
export interface PreviewConfig {
  /** Whether to render in dark mode (default: true) */
  darkMode?: boolean;
  /** Title for the preview document */
  title?: string;
  /** Additional CSS to inject */
  customCss?: string;
}

const TAILWIND_CONFIG = `{
  theme: {
    extend: {
      colors: {
        coral: { 50: '#FFF5F3', 100: '#FFE8E4', 200: '#FFD0C9', 300: '#FFB0A5', 400: '#FF8F7F', 500: '#FF7059', 600: '#E85A4F', 700: '#C4433C', 800: '#A33832', 900: '#7A2A25' },
        teal: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A' },
        gold: { 50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047', 400: '#F5D563', 500: '#EAB308', 600: '#D4A84B', 700: '#A16207', 800: '#854D0E', 900: '#713F12' },
        charcoal: '#151820',
        surface: { DEFAULT: '#1E293B', elevated: '#334155' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Cabin', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}`;

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';

/** Maximum iterations for iterative sanitization to prevent infinite loops */
const MAX_SANITIZE_ITERATIONS = 10;

/**
 * Apply a sanitization function iteratively until the output stabilizes.
 * Prevents bypass via nested/recursive injection patterns like `<scr<script>ipt>`.
 */
function sanitizeIteratively(input: string, sanitizeFn: (s: string) => string): string {
  let result = input;
  for (let i = 0; i < MAX_SANITIZE_ITERATIONS; i++) {
    const next = sanitizeFn(result);
    if (next === result) break;
    result = next;
  }
  return result;
}

/**
 * Create a self-contained HTML preview document for a component.
 *
 * Wraps the given code in a full HTML document with:
 * - Tailwind CDN with ThumbCode color config
 * - Google Fonts (Fraunces, Cabin, JetBrains Mono)
 * - Proper dark/light mode background
 */
export function createPreviewHtml(code: string, config?: PreviewConfig): string {
  const darkMode = config?.darkMode ?? true;
  const title = config?.title ?? 'ThumbCode Component Preview';
  const customCss = sanitizeCss(config?.customCss ?? '');

  // bgColor and textColor are hardcoded constants derived from a boolean,
  // not user input — no validation needed.
  const bgColor = darkMode ? '#151820' : '#F8FAFC';
  const textColor = darkMode ? '#F8FAFC' : '#151820';

  const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
  <script>tailwind.config = ${TAILWIND_CONFIG};</script>
  <style>
    body {
      background: ${bgColor};
      color: ${textColor};
      font-family: 'Cabin', system-ui, sans-serif;
      padding: 24px;
      margin: 0;
    }
    ${customCss}
  </style>
</head>
<body>
  <div id="preview">
    <pre style="font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre-wrap;">${escapedCode}</pre>
  </div>
</body>
</html>`;
}

/**
 * Sanitize CSS to prevent style-tag breakout and CSS injection attacks.
 *
 * Uses iterative sanitization to prevent bypass via nested injection.
 * Strips closing style/script tags, dangerous CSS functions (expression(),
 * url(javascript:), @import), and HTML injection vectors.
 */
export function sanitizeCss(css: string): string {
  return sanitizeIteratively(css, (input) => {
    let sanitized = input;

    // Remove <style> and </style> tags (with optional whitespace/attributes)
    sanitized = sanitized.replace(/<\/?style\s*[^>]*>/gi, '');

    // Remove <script> tags and their content (handles whitespace in closing tag)
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/\s*script\s*>)<[^<]*)*<\/\s*script\s*>/gi,
      ''
    );
    // Remove any remaining opening/closing script tags
    sanitized = sanitized.replace(/<\/?script\s*[^>]*>/gi, '');

    // Remove all remaining HTML tags
    sanitized = sanitized.replace(/<[^>]+>/g, '');

    // Remove CSS expression() — IE-specific XSS vector (case-insensitive, whitespace-tolerant)
    sanitized = sanitized.replace(/expression\s*\(/gi, '');

    // Remove javascript: URLs in CSS url() — handles whitespace and quotes
    sanitized = sanitized.replace(/url\s*\(\s*(['"]?)\s*javascript\s*:/gi, 'url($1');

    // Remove @import rules (can load external stylesheets with JS payloads)
    sanitized = sanitized.replace(/@import\s+(?:url\s*\()?[^;]*/gi, '');

    // Remove -moz-binding (Firefox XSS vector)
    sanitized = sanitized.replace(/-moz-binding\s*:/gi, '');

    // Remove behavior: (IE HTC XSS vector)
    sanitized = sanitized.replace(/behavior\s*:/gi, '');

    return sanitized;
  });
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 *
 * Uses iterative sanitization to prevent bypass via nested/recursive
 * injection patterns (e.g. `<scr<script>ipt>`). Strips dangerous tags,
 * event handlers, javascript: URLs, and style-based injection vectors.
 *
 * This is a defense-in-depth sanitizer for preview content.
 */
export function sanitizeHtml(html: string): string {
  return sanitizeIteratively(html, (input) => {
    let sanitized = input;

    // Remove script tags and their content (handles whitespace in closing tag: </script >)
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/\s*script\s*>)<[^<]*)*<\/\s*script\s*>/gi,
      ''
    );
    // Remove any remaining opening/closing script tags (handles self-closing and orphaned tags)
    sanitized = sanitized.replace(/<\/?script\s*[^>]*>/gi, '');

    // Remove style tags and their content (prevents CSS injection via <style> blocks)
    sanitized = sanitized.replace(
      /<style\b[^<]*(?:(?!<\/\s*style\s*>)<[^<]*)*<\/\s*style\s*>/gi,
      ''
    );
    sanitized = sanitized.replace(/<\/?style\s*[^>]*>/gi, '');

    // Remove event handler attributes (onclick, onerror, onload, etc.)
    // Handles: double-quoted, single-quoted, backtick-quoted, unquoted values
    // Also handles whitespace/newlines between 'on' and '=' and around '='
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]*)/gi, '');

    // Remove javascript: protocol in href/src/action attributes (quoted and unquoted)
    // Handles whitespace between protocol name and colon
    sanitized = sanitized.replace(
      /(href|src|action)\s*=\s*(?:"[^"]*javascript\s*:[^"]*"|'[^']*javascript\s*:[^']*'|javascript\s*:[^\s>]*)/gi,
      '$1=""'
    );

    // Remove data: protocol in src attributes (potential XSS vector via data:text/html)
    sanitized = sanitized.replace(
      /src\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*'|data:text\/html[^\s>]*)/gi,
      'src=""'
    );

    // Remove iframe, object, embed, applet, form tags
    sanitized = sanitized.replace(/<\/?(?:iframe|object|embed|applet|form)\b[^>]*>/gi, '');

    // Remove style attributes containing dangerous values
    // Handles double-quoted, single-quoted, and backtick-quoted attribute values
    sanitized = sanitized.replace(
      /style\s*=\s*(?:"[^"]*(?:expression|url\s*\(|javascript\s*:|-moz-binding)[^"]*"|'[^']*(?:expression|url\s*\(|javascript\s*:|-moz-binding)[^']*'|`[^`]*(?:expression|url\s*\(|javascript\s*:|-moz-binding)[^`]*`)/gi,
      'style=""'
    );

    return sanitized;
  });
}
