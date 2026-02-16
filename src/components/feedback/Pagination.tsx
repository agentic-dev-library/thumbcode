/**
 * Pagination Component
 *
 * Provides page navigation for long lists and data tables.
 * Uses organic styling for brand consistency.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Maximum number of page buttons to show */
  maxVisible?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: Readonly<PaginationProps>) {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): number[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getVisiblePages();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`p-2 rounded-organic-button transition-colors ${
          hasPrev
            ? 'text-neutral-300 hover:bg-surface-elevated hover:text-white'
            : 'text-neutral-600 cursor-not-allowed'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="w-9 h-9 flex items-center justify-center rounded-organic-button font-body text-sm text-neutral-300 hover:bg-surface-elevated hover:text-white transition-colors"
            aria-label="Page 1"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="w-9 h-9 flex items-center justify-center text-neutral-500 font-body text-sm">
              ...
            </span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-organic-button font-body text-sm transition-colors ${
            page === currentPage
              ? 'bg-coral-500 text-white font-semibold'
              : 'text-neutral-300 hover:bg-surface-elevated hover:text-white'
          }`}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="w-9 h-9 flex items-center justify-center text-neutral-500 font-body text-sm">
              ...
            </span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="w-9 h-9 flex items-center justify-center rounded-organic-button font-body text-sm text-neutral-300 hover:bg-surface-elevated hover:text-white transition-colors"
            aria-label={`Page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`p-2 rounded-organic-button transition-colors ${
          hasNext
            ? 'text-neutral-300 hover:bg-surface-elevated hover:text-white'
            : 'text-neutral-600 cursor-not-allowed'
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
