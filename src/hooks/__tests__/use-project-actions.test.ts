/**
 * useProjectActions Hook Tests
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectActions } from '../use-project-actions';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockRemoveProject = vi.fn();
const mockUpdateProject = vi.fn();

vi.mock('@/state', () => ({
  useProjectStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        removeProject: mockRemoveProject,
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    },
    {
      getState: () => ({
        updateProject: mockUpdateProject,
      }),
    }
  ),
}));

describe('useProjectActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deleteProject removes the project and navigates home', () => {
    const { result } = renderHook(() => useProjectActions());

    act(() => {
      result.current.deleteProject('project-1');
    });

    expect(mockRemoveProject).toHaveBeenCalledWith('project-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('archiveProject updates the project status to idle', () => {
    const { result } = renderHook(() => useProjectActions());

    act(() => {
      result.current.archiveProject('project-1');
    });

    expect(mockUpdateProject).toHaveBeenCalledWith('project-1', { status: 'idle' });
  });

  it('openSettings navigates to the project settings page', () => {
    const { result } = renderHook(() => useProjectActions());

    act(() => {
      result.current.openSettings('project-1');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/project/project-1/settings');
  });
});
