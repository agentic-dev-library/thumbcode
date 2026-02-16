import { act } from '@testing-library/react';
import { createFileTreeStore } from '../FileTreeContext';

describe('createFileTreeStore', () => {
  it('should initialize with default state', () => {
    const store = createFileTreeStore();
    const state = store.getState();
    expect(state.expandedPaths.size).toBe(0);
    expect(state.selectedPath).toBeUndefined();
  });

  it('should initialize with provided state', () => {
    const expandedPaths = new Set(['foo', 'bar']);
    const store = createFileTreeStore({ expandedPaths, selectedPath: 'baz' });
    const state = store.getState();
    expect(state.expandedPaths).toEqual(expandedPaths);
    expect(state.selectedPath).toBe('baz');
  });

  it('should toggle expanded paths correctly', () => {
    const store = createFileTreeStore();

    act(() => {
      store.getState().toggleExpanded('folder1');
    });

    expect(store.getState().expandedPaths.has('folder1')).toBe(true);

    act(() => {
      store.getState().toggleExpanded('folder1');
    });

    expect(store.getState().expandedPaths.has('folder1')).toBe(false);
  });

  it('should set selected path correctly', () => {
    const store = createFileTreeStore();

    act(() => {
      store.getState().setSelectedPath('file1.ts');
    });

    expect(store.getState().selectedPath).toBe('file1.ts');
  });

  it('should set expanded paths correctly', () => {
    const store = createFileTreeStore();
    const newPaths = new Set(['a', 'b']);

    act(() => {
      store.getState().setExpandedPaths(newPaths);
    });

    expect(store.getState().expandedPaths).toEqual(newPaths);
  });

  it('should treat expandedPaths as immutable updates', () => {
    const store = createFileTreeStore();
    const state1 = store.getState();

    act(() => {
      store.getState().toggleExpanded('test');
    });

    const state2 = store.getState();
    expect(state1.expandedPaths).not.toBe(state2.expandedPaths);
  });
});
