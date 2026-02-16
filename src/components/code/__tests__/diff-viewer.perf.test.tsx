import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiffViewer } from '../DiffViewer';
import * as ParseDiffModule from '../parse-diff';

// Mock dependencies to isolate DiffViewer performance
vi.mock('@/components/icons', () => ({
  ChevronDownIcon: () => <span>ChevronDown</span>,
}));

vi.mock('@/components/ui', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: mock
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

vi.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { card: {} },
}));

describe('DiffViewer Performance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not re-parse diff on re-render (memoization verification)', async () => {
    const linesCount = 100;
    const oldContent = Array.from({ length: linesCount }, (_, i) => `original line ${i}`).join(
      '\n'
    );
    const newContent = Array.from({ length: linesCount }, (_, i) => `modified line ${i}`).join(
      '\n'
    );

    // Spy on parseDiff to verify memoization
    const parseDiffSpy = vi.spyOn(ParseDiffModule, 'parseDiff');

    // Initial render
    render(<DiffViewer oldContent={oldContent} newContent={newContent} filename="benchmark.ts" />);

    const initialCallCount = parseDiffSpy.mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(0);

    const button = screen.getByRole('button');

    // Trigger re-render by collapsing (should NOT call parseDiff again)
    await act(async () => {
      fireEvent.click(button);
    });

    // Verify parseDiff was NOT called again — memoization is working
    expect(parseDiffSpy.mock.calls.length).toBe(initialCallCount);
  });

  it('measures re-render time with large diffs', async () => {
    const linesCount = 5000;
    const oldContent = Array.from({ length: linesCount }, (_, i) => `original line ${i}`).join(
      '\n'
    );
    const newContent = Array.from({ length: linesCount }, (_, i) => `modified line ${i}`).join(
      '\n'
    );

    // Initial Render
    const startRender = performance.now();
    render(<DiffViewer oldContent={oldContent} newContent={newContent} filename="benchmark.ts" />);
    const endRender = performance.now();
    console.log(`[Benchmark] Initial render time: ${(endRender - startRender).toFixed(2)}ms`);

    const button = screen.getByRole('button');

    // Trigger re-render by collapsing
    const startUpdate = performance.now();
    await act(async () => {
      fireEvent.click(button);
    });
    const endUpdate = performance.now();

    const updateTime = endUpdate - startUpdate;
    console.log(`[Benchmark] Re-render time (collapse): ${updateTime.toFixed(2)}ms`);

    // Re-render should be significantly faster than initial render
    expect(updateTime).toBeLessThan(endRender - startRender);
  }, 10000);
});
