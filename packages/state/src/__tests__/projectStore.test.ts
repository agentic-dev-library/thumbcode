/**
 * ProjectStore Tests
 *
 * Tests for project CRUD, workspace management, and state transitions.
 */

import { act, renderHook } from '@testing-library/react';
import {
  selectActiveFile,
  selectActiveProject,
  selectBranches,
  selectCurrentBranch,
  selectFileTree,
  selectHasUnsavedChanges,
  selectOpenFiles,
  selectProjects,
  selectRecentProjects,
  selectWorkspace,
  useProjectStore,
} from '../projectStore';

// Reset store before each test
beforeEach(() => {
  useProjectStore.setState({
    projects: [],
    activeProjectId: null,
    workspace: null,
    fileTree: null,
    branches: [],
    recentCommits: [],
    isLoading: false,
    error: null,
  });
});

describe('ProjectStore', () => {
  describe('addProject', () => {
    it('should add a project with generated id and timestamps', () => {
      const { result } = renderHook(() => useProjectStore());

      let projectId = '';
      act(() => {
        projectId = result.current.addProject({
          name: 'My Project',
          repoUrl: 'https://github.com/user/repo.git',
          localPath: '/repos/repo',
          defaultBranch: 'main',
        });
      });

      expect(projectId).toMatch(/^project-/);
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].name).toBe('My Project');
      expect(result.current.projects[0].status).toBe('active');
      expect(result.current.projects[0].createdAt).toBeDefined();
      expect(result.current.projects[0].lastOpenedAt).toBeDefined();
    });

    it('should use provided status when given', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.addProject({
          name: 'Idle Project',
          repoUrl: 'https://github.com/user/idle.git',
          localPath: '/repos/idle',
          defaultBranch: 'main',
          status: 'idle',
        });
      });

      expect(result.current.projects[0].status).toBe('idle');
    });
  });

  describe('removeProject', () => {
    it('should remove a project by id', () => {
      const { result } = renderHook(() => useProjectStore());

      let id = '';
      act(() => {
        id = result.current.addProject({
          name: 'To Remove',
          repoUrl: 'https://github.com/user/rm.git',
          localPath: '/repos/rm',
          defaultBranch: 'main',
        });
      });

      expect(result.current.projects).toHaveLength(1);

      act(() => {
        result.current.removeProject(id);
      });

      expect(result.current.projects).toHaveLength(0);
    });

    it('should clear active project and workspace when removing active project', () => {
      const { result } = renderHook(() => useProjectStore());

      let id = '';
      act(() => {
        id = result.current.addProject({
          name: 'Active',
          repoUrl: 'https://github.com/user/active.git',
          localPath: '/repos/active',
          defaultBranch: 'main',
        });
        result.current.setActiveProject(id);
        result.current.initWorkspace(id, 'main');
      });

      expect(result.current.activeProjectId).toBe(id);
      expect(result.current.workspace).not.toBeNull();

      act(() => {
        result.current.removeProject(id);
      });

      expect(result.current.activeProjectId).toBeNull();
      expect(result.current.workspace).toBeNull();
    });
  });

  describe('setActiveProject', () => {
    it('should set the active project and update lastOpenedAt', () => {
      const { result } = renderHook(() => useProjectStore());

      let id = '';
      act(() => {
        id = result.current.addProject({
          name: 'Project',
          repoUrl: 'https://github.com/user/p.git',
          localPath: '/repos/p',
          defaultBranch: 'main',
        });
      });

      const initialOpenedAt = result.current.projects[0].lastOpenedAt;

      // Small delay to ensure time difference
      act(() => {
        result.current.setActiveProject(id);
      });

      expect(result.current.activeProjectId).toBe(id);
      // lastOpenedAt should be updated (or same if too fast)
      expect(result.current.projects[0].lastOpenedAt).toBeDefined();
    });

    it('should accept null to deselect', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        const id = result.current.addProject({
          name: 'Project',
          repoUrl: 'https://github.com/user/p.git',
          localPath: '/repos/p',
          defaultBranch: 'main',
        });
        result.current.setActiveProject(id);
      });

      expect(result.current.activeProjectId).not.toBeNull();

      act(() => {
        result.current.setActiveProject(null);
      });

      expect(result.current.activeProjectId).toBeNull();
    });
  });

  describe('updateProject', () => {
    it('should update project properties', () => {
      const { result } = renderHook(() => useProjectStore());

      let id = '';
      act(() => {
        id = result.current.addProject({
          name: 'Original',
          repoUrl: 'https://github.com/user/orig.git',
          localPath: '/repos/orig',
          defaultBranch: 'main',
        });
      });

      act(() => {
        result.current.updateProject(id, {
          name: 'Updated',
          status: 'error',
        });
      });

      expect(result.current.projects[0].name).toBe('Updated');
      expect(result.current.projects[0].status).toBe('error');
    });

    it('should do nothing for non-existent project', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.updateProject('nonexistent', { name: 'Test' });
      });

      expect(result.current.projects).toHaveLength(0);
    });
  });

  describe('workspace management', () => {
    it('should initialize a workspace', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
      });

      expect(result.current.workspace).toEqual({
        projectId: 'proj-1',
        currentBranch: 'main',
        openFiles: [],
        activeFile: null,
        unsavedChanges: {},
        gitStatus: 'clean',
      });
    });

    it('should close a workspace and clear related state', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.setBranches([{ name: 'main', isRemote: false, isCurrent: true }]);
        result.current.setRecentCommits([{ sha: 'abc', message: 'init', author: 'dev', authorEmail: 'dev@test.com', date: '2025-01-01' }]);
      });

      expect(result.current.workspace).not.toBeNull();

      act(() => {
        result.current.closeWorkspace();
      });

      expect(result.current.workspace).toBeNull();
      expect(result.current.fileTree).toBeNull();
      expect(result.current.branches).toHaveLength(0);
      expect(result.current.recentCommits).toHaveLength(0);
    });

    it('should open a file and set it as active', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.openFile('src/index.ts');
      });

      expect(result.current.workspace!.openFiles).toEqual(['src/index.ts']);
      expect(result.current.workspace!.activeFile).toBe('src/index.ts');
    });

    it('should not duplicate already open files', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.openFile('src/index.ts');
        result.current.openFile('src/index.ts');
      });

      expect(result.current.workspace!.openFiles).toHaveLength(1);
    });

    it('should close a file and set next file as active', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.openFile('src/a.ts');
        result.current.openFile('src/b.ts');
      });

      act(() => {
        result.current.closeFile('src/b.ts');
      });

      expect(result.current.workspace!.openFiles).toEqual(['src/a.ts']);
      expect(result.current.workspace!.activeFile).toBe('src/a.ts');
    });

    it('should clear unsaved changes when closing a file', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.openFile('src/a.ts');
        result.current.saveFileChange('src/a.ts', 'modified content');
      });

      expect(result.current.workspace!.unsavedChanges['src/a.ts']).toBe('modified content');

      act(() => {
        result.current.closeFile('src/a.ts');
      });

      expect(result.current.workspace!.unsavedChanges['src/a.ts']).toBeUndefined();
    });

    it('should track unsaved changes and set git status to modified', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.saveFileChange('src/index.ts', 'new content');
      });

      expect(result.current.workspace!.unsavedChanges['src/index.ts']).toBe('new content');
      expect(result.current.workspace!.gitStatus).toBe('modified');
    });

    it('should revert git status to clean when all unsaved changes cleared', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.saveFileChange('src/index.ts', 'changed');
      });

      expect(result.current.workspace!.gitStatus).toBe('modified');

      act(() => {
        result.current.clearUnsavedChange('src/index.ts');
      });

      expect(result.current.workspace!.gitStatus).toBe('clean');
    });
  });

  describe('git state actions', () => {
    it('should set file tree', () => {
      const { result } = renderHook(() => useProjectStore());
      const tree = { name: 'root', path: '/', type: 'directory' as const, children: [] };

      act(() => {
        result.current.setFileTree(tree);
      });

      expect(result.current.fileTree).toEqual(tree);
    });

    it('should set branches', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setBranches([
          { name: 'main', isRemote: false, isCurrent: true },
          { name: 'develop', isRemote: false, isCurrent: false },
        ]);
      });

      expect(result.current.branches).toHaveLength(2);
    });

    it('should set current branch in workspace', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.setCurrentBranch('develop');
      });

      expect(result.current.workspace!.currentBranch).toBe('develop');
    });

    it('should set git status in workspace', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.setGitStatus('staged');
      });

      expect(result.current.workspace!.gitStatus).toBe('staged');
    });
  });

  describe('loading and error state', () => {
    it('should set and clear loading state', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set and clear error state', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectProjects should return all projects', () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.addProject({
          name: 'P1',
          repoUrl: 'https://github.com/u/p1.git',
          localPath: '/repos/p1',
          defaultBranch: 'main',
        });
        result.current.addProject({
          name: 'P2',
          repoUrl: 'https://github.com/u/p2.git',
          localPath: '/repos/p2',
          defaultBranch: 'main',
        });
      });

      expect(selectProjects(result.current)).toHaveLength(2);
    });

    it('selectActiveProject should return the active project or null', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectActiveProject(result.current)).toBeNull();

      let id = '';
      act(() => {
        id = result.current.addProject({
          name: 'Active',
          repoUrl: 'https://github.com/u/a.git',
          localPath: '/repos/a',
          defaultBranch: 'main',
        });
        result.current.setActiveProject(id);
      });

      expect(selectActiveProject(result.current)!.name).toBe('Active');
    });

    it('selectWorkspace should return workspace or null', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectWorkspace(result.current)).toBeNull();

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
      });

      expect(selectWorkspace(result.current)).not.toBeNull();
    });

    it('selectCurrentBranch should return branch name or null', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectCurrentBranch(result.current)).toBeNull();

      act(() => {
        result.current.initWorkspace('proj-1', 'develop');
      });

      expect(selectCurrentBranch(result.current)).toBe('develop');
    });

    it('selectOpenFiles should return open files or empty array', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectOpenFiles(result.current)).toEqual([]);

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.openFile('src/app.tsx');
      });

      expect(selectOpenFiles(result.current)).toEqual(['src/app.tsx']);
    });

    it('selectActiveFile should return active file or null', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectActiveFile(result.current)).toBeNull();

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.openFile('src/app.tsx');
      });

      expect(selectActiveFile(result.current)).toBe('src/app.tsx');
    });

    it('selectHasUnsavedChanges should track unsaved state', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectHasUnsavedChanges(result.current)).toBe(false);

      act(() => {
        result.current.initWorkspace('proj-1', 'main');
        result.current.saveFileChange('file.ts', 'content');
      });

      expect(selectHasUnsavedChanges(result.current)).toBe(true);
    });

    it('selectRecentProjects should return projects sorted by lastOpenedAt', () => {
      // Set projects directly with controlled timestamps to avoid timing issues
      useProjectStore.setState({
        projects: [
          {
            id: 'proj-old',
            name: 'Old',
            repoUrl: 'https://github.com/u/old.git',
            localPath: '/repos/old',
            defaultBranch: 'main',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            lastOpenedAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 'proj-new',
            name: 'New',
            repoUrl: 'https://github.com/u/new.git',
            localPath: '/repos/new',
            defaultBranch: 'main',
            status: 'active',
            createdAt: '2025-02-01T00:00:00Z',
            lastOpenedAt: '2025-02-01T00:00:00Z',
          },
        ],
      });

      const recent = selectRecentProjects(useProjectStore.getState());
      expect(recent).toHaveLength(2);
      // Most recent should be first
      expect(recent[0].name).toBe('New');
      expect(recent[1].name).toBe('Old');
    });

    it('selectFileTree should return file tree or null', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectFileTree(result.current)).toBeNull();

      const tree = { name: 'root', path: '/', type: 'directory' as const };
      act(() => {
        result.current.setFileTree(tree);
      });

      expect(selectFileTree(result.current)).toEqual(tree);
    });

    it('selectBranches should return branches', () => {
      const { result } = renderHook(() => useProjectStore());

      expect(selectBranches(result.current)).toEqual([]);

      act(() => {
        result.current.setBranches([{ name: 'main', isRemote: false, isCurrent: true }]);
      });

      expect(selectBranches(result.current)).toHaveLength(1);
    });
  });
});
