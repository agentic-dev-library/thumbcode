/**
 * PreviewPanel Component
 *
 * Split-view panel showing code alongside a live preview.
 * Supports three view modes: Preview only, Code only, and Side by Side.
 * Includes code copying, open-in-new-tab, and a resizable divider.
 */

import { useCallback, useRef, useState } from 'react';
import { LivePreview } from './LivePreview';

/** View mode for the panel layout */
export type PreviewViewMode = 'preview' | 'code' | 'side-by-side';

/** Props for the PreviewPanel component */
export interface PreviewPanelProps {
  /** Source code to display */
  code: string;
  /** Self-contained HTML for the live preview */
  previewHtml: string;
  /** Optional title for the panel */
  title?: string;
  /** Programming language for syntax display (default: "tsx") */
  language?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

export function PreviewPanel({
  code,
  previewHtml,
  title,
  language = 'tsx',
  className = '',
}: Readonly<PreviewPanelProps>) {
  const [viewMode, setViewMode] = useState<PreviewViewMode>('side-by-side');
  const [copied, setCopied] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the code text
      setCopied(false);
    }
  }, [code]);

  const handleOpenInNewTab = useCallback(() => {
    // Open a sandboxed iframe in a new tab rather than a raw blob URL,
    // which would inherit same-origin privileges
    const wrapper = `<!DOCTYPE html>
<html><head><title>ThumbCode Preview</title><style>
  body { margin: 0; height: 100vh; }
  iframe { width: 100%; height: 100%; border: none; }
</style></head><body>
<iframe sandbox="allow-scripts" srcdoc="${previewHtml.replace(/"/g, '&quot;')}"></iframe>
</body></html>`;
    const blob = new Blob([wrapper], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Allow enough time for the new tab to load before revoking
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [previewHtml]);

  const handleMouseDown = useCallback(() => {
    isDraggingRef.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setSplitRatio(percentage);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const showCode = viewMode === 'code' || viewMode === 'side-by-side';
  const showPreview = viewMode === 'preview' || viewMode === 'side-by-side';
  const isSideBySide = viewMode === 'side-by-side';

  return (
    <div
      className={`bg-surface-elevated rounded-organic-card shadow-organic-card border border-neutral-700 overflow-hidden ${className}`}
      style={{ transform: 'rotate(-0.15deg)' }}
      data-testid="preview-panel"
    >
      {/* Header with tabs and actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700">
        <div className="flex items-center gap-1">
          {title && (
            <span className="font-display text-sm text-white font-semibold mr-3">{title}</span>
          )}
          {/* Tab bar */}
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-xs font-body rounded-organic-badge transition-colors ${
              viewMode === 'preview'
                ? 'bg-teal-600 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Show preview"
            aria-pressed={viewMode === 'preview'}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 text-xs font-body rounded-organic-badge transition-colors ${
              viewMode === 'code' ? 'bg-teal-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Show code"
            aria-pressed={viewMode === 'code'}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 text-xs font-body rounded-organic-badge transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-teal-600 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Show side by side"
            aria-pressed={viewMode === 'side-by-side'}
          >
            Side by Side
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {showCode && (
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2 py-1 text-xs font-body text-neutral-400 hover:text-white transition-colors rounded-organic-badge"
              aria-label="Copy code"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          )}
          {showPreview && (
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="px-2 py-1 text-xs font-body text-neutral-400 hover:text-white transition-colors rounded-organic-badge"
              aria-label="Open in new tab"
            >
              Open in New Tab
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div
        ref={containerRef}
        className="flex"
        style={{ minHeight: 300 }}
        data-testid="preview-panel-content"
      >
        {/* Code pane */}
        {showCode && (
          <div
            className="overflow-auto bg-charcoal"
            style={{
              width: isSideBySide ? `${splitRatio}%` : '100%',
              maxHeight: 500,
            }}
            data-testid="preview-panel-code"
          >
            <pre className="p-4 text-xs leading-relaxed font-mono text-neutral-300 whitespace-pre-wrap">
              <code data-language={language}>{code}</code>
            </pre>
          </div>
        )}

        {/* Resizable divider */}
        {isSideBySide && (
          <div
            className="w-1 bg-neutral-700 hover:bg-teal-600 cursor-col-resize transition-colors flex-shrink-0"
            onMouseDown={handleMouseDown}
            data-testid="preview-panel-divider"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize code and preview panels"
          />
        )}

        {/* Preview pane */}
        {showPreview && (
          <div
            className="flex-1 overflow-hidden"
            style={{
              width: isSideBySide ? `${100 - splitRatio}%` : '100%',
            }}
            data-testid="preview-panel-preview"
          >
            <LivePreview html={previewHtml} title={title} height={300} />
          </div>
        )}
      </div>
    </div>
  );
}
