/**
 * useProjectList Hook Tests
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectList } from '../use-project-list';

const mockProjects = [
  {
    id: 'p1',
    name: 'ThumbCode',
    repoUrl: 'https://github.com/user/thumbcode.git',
    localPath: '/thumbcode',
    defaultBranch: 'main',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    lastOpenedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'p2',
    name: 'Other App',
    repoUrl: 'https://github.com/user/other-app.git',
    localPath: '/other-app',
    defaultBranch: 'main',
    status: 'idle',
    createdAt: '2026-01-01T00:00:00Z',
    lastOpenedAt: '2026-01-10T00:00:00Z',
  },
];

vi.mock('@thumbcode/state', () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = { projects: mockProjects };
    return selector(state);
  },
  selectProjects: (state: { projects: unknown }) => state.projects,
}));

describe('useProjectList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all projects when no search query', () => {
    const { result } = renderHook(() => useProjectList());
    expect(result.current.filteredProjects).toHaveLength(2);
    expect(result.current.searchQuery).toBe('');
  });

  it('filters projects by name', () => {
    const { result } = renderHook(() => useProjectList());

    act(() => {
      result.current.setSearchQuery('thumb');
    });

    expect(result.current.filteredProjects).toHaveLength(1);
    expect(result.current.filteredProjects[0].name).toBe('ThumbCode');
  });

  it('filters projects by repo URL', () => {
    const { result } = renderHook(() => useProjectList());

    act(() => {
      result.current.setSearchQuery('other-app');
    });

    expect(result.current.filteredProjects).toHaveLength(1);
    expect(result.current.filteredProjects[0].id).toBe('p2');
  });

  it('returns empty list when no match', () => {
    const { result } = renderHook(() => useProjectList());

    act(() => {
      result.current.setSearchQuery('nonexistent');
    });

    expect(result.current.filteredProjects).toHaveLength(0);
  });

  it('search is case-insensitive', () => {
    const { result } = renderHook(() => useProjectList());

    act(() => {
      result.current.setSearchQuery('THUMBCODE');
    });

    expect(result.current.filteredProjects).toHaveLength(1);
  });

  it('reports hasProjects as true when projects exist', () => {
    const { result } = renderHook(() => useProjectList());
    expect(result.current.hasProjects).toBe(true);
  });
});
