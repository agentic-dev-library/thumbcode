import { act, fireEvent, render, screen } from '@testing-library/react';
import { DiffViewer } from '../DiffViewer';

// Mock dependencies to isolate DiffViewer performance
vi.mock('@/components/icons', () => ({
  ChevronDownIcon: () => <span>ChevronDown</span>,
  it('measures re-render time with large diffs', async () => {
    // Generate large content (~5000 lines) to make parsing expensive
    const linesCount = 5000;
    const oldContent = Array.from(
      { length: linesCount },
      (_, i) => `original line ${i}`
    ).join('\n');
    const newContent = Array.from(
      { length: linesCount },
      (_, i) => `modified line ${i}`
    ).join('\n');

    // Spy on parseDiff to verify memoization works
    const parseDiffSpy = vi.spyOn(
      await import('../DiffViewer'),
      'parseDiff'
    );

    // Initial Render
    const startRender = performance.now();
    render(
      <DiffViewer
        oldContent={oldContent}
        newContent={newContent}
        filename="benchmark.ts"
      />
    );
    const endRender = performance.now();
    console.log(
      `[Benchmark] Initial render time: ${(endRender - startRender).toFixed(2)}ms`
    );

    const initialCallCount = parseDiffSpy.mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(0);

    const button = screen.getByRole('button');

    // Trigger re-render by collapsing
    const startUpdate = performance.now();
    await act(async () => {
      fireEvent.click(button);
    });
    const endUpdate = performance.now();

    const updateTime = endUpdate - startUpdate;
    console.log(
      `[Benchmark] Re-render time (collapse): ${updateTime.toFixed(2)}ms`
    );

    // Verify parseDiff was NOT called again (memoization working)
    expect(parseDiffSpy.mock.calls.length).toBe(initialCallCount);
    expect(updateTime).toBeGreaterThan(0);

    parseDiffSpy.mockRestore();
  });
  }, 10000);
});
