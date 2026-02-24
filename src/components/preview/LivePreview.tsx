/**
 * LivePreview Component
 *
 * Renders HTML content in a sandboxed iframe for safe component previews.
 * Uses srcdoc for direct HTML injection without external URL dependencies.
 * Includes loading state, error boundary, and refresh capability.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Props for the LivePreview component */
export interface LivePreviewProps {
  /** Self-contained HTML to render in the iframe */
  html: string;
  /** Optional title for the preview frame */
  title?: string;
  /** Optional fixed height in pixels (default: 300) */
  height?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

export function LivePreview({
  html,
  title = 'Component Preview',
  height = 300,
  className = '',
}: Readonly<LivePreviewProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Attach native event listeners directly on the iframe for cross-environment compatibility
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [handleLoad, handleError]);

  if (!html || html.trim().length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-surface rounded-organic-card border border-neutral-700 ${className}`}
        style={{ height }}
        data-testid="live-preview-empty"
      >
        <span className="font-body text-sm text-neutral-500">No preview content available</span>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-surface rounded-organic-card border border-neutral-700 overflow-hidden ${className}`}
      data-testid="live-preview-container"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-elevated border-b border-neutral-700">
        <span className="font-body text-xs text-neutral-400 truncate">{title}</span>
        <button
          type="button"
          onClick={handleRefresh}
          className="px-2 py-1 text-xs font-body text-neutral-400 hover:text-white transition-colors rounded-organic-badge"
          aria-label="Refresh preview"
        >
          Refresh
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 top-8 flex items-center justify-center bg-surface/80 z-10"
          data-testid="live-preview-loading"
        >
          <span className="font-body text-sm text-neutral-400">Loading preview...</span>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="absolute inset-0 top-8 flex flex-col items-center justify-center bg-surface z-10 gap-2"
          data-testid="live-preview-error"
        >
          <span className="font-body text-sm text-coral-500">Preview failed to load</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-1 text-xs font-body text-teal-400 hover:text-teal-300 transition-colors"
            aria-label="Retry preview"
          >
            Try again
          </button>
        </div>
      )}

      {/* Sandboxed iframe */}
      <iframe
        key={refreshKey}
        ref={iframeRef}
        srcDoc={html}
        title={title}
        sandbox="allow-scripts"
        className="w-full border-0"
        style={{ height }}
        data-testid="live-preview-iframe"
      />
    </div>
  );
}
