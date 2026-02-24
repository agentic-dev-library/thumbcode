/**
 * Preview Sandbox Utility Tests
 *
 * Tests for createPreviewHtml and sanitizeHtml functions.
 */

import { createPreviewHtml, sanitizeHtml } from '../preview-sandbox';

describe('createPreviewHtml', () => {
  it('generates a complete HTML document with Tailwind CDN', () => {
    const html = createPreviewHtml('<div>Hello</div>');

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('cdn.tailwindcss.com');
    expect(html).toContain('tailwind.config');
  });

  it('includes ThumbCode color configuration', () => {
    const html = createPreviewHtml('test');

    expect(html).toContain('#FF7059'); // coral-500
    expect(html).toContain('#0D9488'); // teal-600
    expect(html).toContain('#F5D563'); // gold-400
    expect(html).toContain('#151820'); // charcoal
  });

  it('includes Google Fonts link for Fraunces, Cabin, JetBrains Mono', () => {
    const html = createPreviewHtml('test');

    expect(html).toContain('fonts.googleapis.com');
    expect(html).toContain('Fraunces');
    expect(html).toContain('Cabin');
    expect(html).toContain('JetBrains+Mono');
  });

  it('uses dark mode background by default', () => {
    const html = createPreviewHtml('test');

    expect(html).toContain('background: #151820');
    expect(html).toContain('color: #F8FAFC');
  });

  it('uses light mode background when darkMode is false', () => {
    const html = createPreviewHtml('test', { darkMode: false });

    expect(html).toContain('background: #F8FAFC');
    expect(html).toContain('color: #151820');
  });

  it('escapes HTML in the code content', () => {
    const html = createPreviewHtml('<script>alert("xss")</script>');

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });

  it('uses the provided title', () => {
    const html = createPreviewHtml('test', { title: 'My Component' });

    expect(html).toContain('<title>My Component</title>');
  });

  it('injects custom CSS when provided', () => {
    const html = createPreviewHtml('test', { customCss: '.custom { color: red; }' });

    expect(html).toContain('.custom { color: red; }');
  });
});

describe('sanitizeHtml', () => {
  it('removes script tags and their content', () => {
    const result = sanitizeHtml('<div>Hello</div><script>alert("xss")</script>');

    expect(result).toContain('<div>Hello</div>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('removes event handler attributes', () => {
    const result = sanitizeHtml('<img src="img.png" onerror="alert(1)">');

    expect(result).toContain('src="img.png"');
    expect(result).not.toContain('onerror');
  });

  it('removes javascript: protocol from href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>');

    expect(result).not.toContain('javascript:');
  });

  it('removes iframe tags', () => {
    const result = sanitizeHtml('<iframe src="evil.html"></iframe><div>safe</div>');

    expect(result).not.toContain('iframe');
    expect(result).toContain('<div>safe</div>');
  });

  it('removes object and embed tags', () => {
    const result = sanitizeHtml('<object data="evil.swf"></object><embed src="evil.swf">');

    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
  });

  it('preserves safe HTML content', () => {
    const safeHtml = '<div class="test"><p>Hello <strong>World</strong></p></div>';
    const result = sanitizeHtml(safeHtml);

    expect(result).toBe(safeHtml);
  });

  it('handles multiple XSS vectors in the same string', () => {
    const malicious =
      '<div onclick="steal()">text</div><script>evil()</script><iframe src="bad"></iframe>';
    const result = sanitizeHtml(malicious);

    expect(result).not.toContain('onclick');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('iframe');
    expect(result).toContain('text');
  });
});
