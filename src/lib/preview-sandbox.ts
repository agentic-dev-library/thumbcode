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

  const bgColor = darkMode ? '#151820' : '#F8FAFC';
  const textColor = darkMode ? '#F8FAFC' : '#151820';

  const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
  <script>tailwind.config = ${TAILWIND_CONFIG};<\/script>
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
 * Prevents injection of closing style tags, script blocks, and
 * dangerous CSS functions like expression() and url(javascript:).
 */
export function sanitizeCss(css: string): string {
  // Prevent breaking out of <style> block
  let sanitized = css.replace(/<\/?style\b[^>]*>/gi, '');

  // Remove any HTML tags that could have been injected
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // Remove CSS expression() (IE-specific XSS vector)
  sanitized = sanitized.replace(/expression\s*\(/gi, '');

  // Remove javascript: URLs in CSS url()
  sanitized = sanitized.replace(/url\s*\(\s*(['"]?)javascript:/gi, 'url($1');

  return sanitized;
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 *
 * Strips dangerous tags and attributes from user-provided HTML.
 * This is a basic sanitizer for preview content -- NOT a full
 * HTML sanitizer for untrusted user input.
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  // Handles quoted, single-quoted, backtick-quoted, and unquoted values
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]*)/gi, '');

  // Remove javascript: protocol in href/src attributes (quoted and unquoted)
  sanitized = sanitized.replace(
    /(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]*)/gi,
    '$1=""'
  );

  // Remove data: protocol in src attributes (potential XSS vector)
  sanitized = sanitized.replace(
    /src\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*'|data:text\/html[^\s>]*)/gi,
    'src=""'
  );

  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<\/?(?:iframe|object|embed|applet|form)\b[^>]*>/gi, '');

  // Remove style attributes containing expressions or url() (quoted and single-quoted)
  sanitized = sanitized.replace(
    /style\s*=\s*(?:"[^"]*(?:expression|url\s*\()[^"]*"|'[^']*(?:expression|url\s*\()[^']*')/gi,
    'style=""'
  );

  return sanitized;
}
