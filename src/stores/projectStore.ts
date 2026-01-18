/**
 * Project Store
 *
 * Manages project and workspace state for Git repository operations.
 * Integrates with isomorphic-git for client-side Git operations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// File tree node for displaying repository structure
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  lastModified?: string;
}

// Git commit information
export interface Commit {
  sha: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
}

// Git branch information
export interface Branch {
  name: string;
  isRemote: boolean;
  isCurrent: boolean;
  lastCommitSha?: string;
}

// Project configuration
export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  localPath: string;
  defaultBranch: string;
  createdAt: string;
  lastOpenedAt: string;
}

// Workspace state for active editing
export interface Workspace {
  projectId: string;
  currentBranch: string;
  openFiles: string[];
  activeFile: string | null;
  unsavedChanges: Record<string, string>;
  gitStatus: 'clean' | 'modified' | 'staged' | 'conflict';
}

interface ProjectState {
  // State
  projects: Project[];
  activeProjectId: string | null;
  workspace: Workspace | null;
  fileTree: FileNode | null;
  branches: Branch[];
  recentCommits: Commit[];
  isLoading: boolean;
  error: string | null;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'lastOpenedAt'>) => string;
  removeProject: (projectId: string) => void;
  setActiveProject: (projectId: string | null) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;

  // Workspace actions
  initWorkspace: (projectId: string, branch: string) => void;
  closeWorkspace: () => void;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string | null) => void;
  saveFileChange: (filePath: string, content: string) => void;
  clearUnsavedChange: (filePath: string) => void;

  // Git state actions
  setFileTree: (tree: FileNode | null) => void;
  setBranches: (branches: Branch[]) => void;
  setCurrentBranch: (branch: string) => void;
  setRecentCommits: (commits: Commit[]) => void;
  setGitStatus: (status: Workspace['gitStatus']) => void;

  // Loading/error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      immer((set, _get) => ({
        projects: [],
        activeProjectId: null,
        workspace: null,
        fileTree: null,
        branches: [],
        recentCommits: [],
        isLoading: false,
        error: null,

        addProject: (project) => {
          const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          set((state) => {
            state.projects.push({
              ...project,
              id: projectId,
              createdAt: now,
              lastOpenedAt: now,
            });
          });
          return projectId;
        },

        removeProject: (projectId) =>
          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== projectId);
            if (state.activeProjectId === projectId) {
              state.activeProjectId = null;
              state.workspace = null;
              state.fileTree = null;
            }
          }),

        setActiveProject: (projectId) =>
          set((state) => {
            state.activeProjectId = projectId;
            if (projectId) {
              const project = state.projects.find((p) => p.id === projectId);
              if (project) {
                project.lastOpenedAt = new Date().toISOString();
              }
            }
          }),

        updateProject: (projectId, updates) =>
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
              Object.assign(project, updates);
            }
          }),

        initWorkspace: (projectId, branch) =>
          set((state) => {
            state.workspace = {
              projectId,
              currentBranch: branch,
              openFiles: [],
              activeFile: null,
              unsavedChanges: {},
              gitStatus: 'clean',
            };
          }),

        closeWorkspace: () =>
          set((state) => {
            state.workspace = null;
            state.fileTree = null;
            state.branches = [];
            state.recentCommits = [];
          }),

        openFile: (filePath) =>
          set((state) => {
            if (state.workspace && !state.workspace.openFiles.includes(filePath)) {
              state.workspace.openFiles.push(filePath);
              state.workspace.activeFile = filePath;
            }
          }),

        closeFile: (filePath) =>
          set((state) => {
            if (state.workspace) {
              state.workspace.openFiles = state.workspace.openFiles.filter((f) => f !== filePath);
              delete state.workspace.unsavedChanges[filePath];
              if (state.workspace.activeFile === filePath) {
                state.workspace.activeFile = state.workspace.openFiles[0] ?? null;
              }
            }
          }),

        setActiveFile: (filePath) =>
          set((state) => {
            if (state.workspace) {
              state.workspace.activeFile = filePath;
            }
          }),

        saveFileChange: (filePath, content) =>
          set((state) => {
            if (state.workspace) {
              state.workspace.unsavedChanges[filePath] = content;
              state.workspace.gitStatus = 'modified';
            }
          }),

        clearUnsavedChange: (filePath) =>
          set((state) => {
            if (state.workspace) {
              delete state.workspace.unsavedChanges[filePath];
              if (Object.keys(state.workspace.unsavedChanges).length === 0) {
                state.workspace.gitStatus = 'clean';
              }
            }
          }),

        setFileTree: (tree) =>
          set((state) => {
            state.fileTree = tree;
          }),

        setBranches: (branches) =>
          set((state) => {
            state.branches = branches;
          }),

        setCurrentBranch: (branch) =>
          set((state) => {
            if (state.workspace) {
              state.workspace.currentBranch = branch;
            }
          }),

        setRecentCommits: (commits) =>
          set((state) => {
            state.recentCommits = commits;
          }),

        setGitStatus: (status) =>
          set((state) => {
            if (state.workspace) {
              state.workspace.gitStatus = status;
            }
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        clearError: () =>
          set((state) => {
            state.error = null;
          }),
      })),
      {
        name: 'thumbcode-project-storage',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist projects, not workspace state
        partialize: (state) => ({
          projects: state.projects,
          activeProjectId: state.activeProjectId,
        }),
      }
    ),
    { name: 'ProjectStore' }
  )
);

// Selectors for optimal re-renders
export const selectProjects = (state: ProjectState) => state.projects;
export const selectActiveProject = (state: ProjectState) =>
  state.projects.find((p) => p.id === state.activeProjectId) ?? null;
export const selectWorkspace = (state: ProjectState) => state.workspace;
export const selectFileTree = (state: ProjectState) => state.fileTree;
export const selectBranches = (state: ProjectState) => state.branches;
export const selectCurrentBranch = (state: ProjectState) => state.workspace?.currentBranch ?? null;
export const selectOpenFiles = (state: ProjectState) => state.workspace?.openFiles ?? [];
export const selectActiveFile = (state: ProjectState) => state.workspace?.activeFile ?? null;
export const selectHasUnsavedChanges = (state: ProjectState) =>
  Object.keys(state.workspace?.unsavedChanges ?? {}).length > 0;
export const selectRecentProjects = (state: ProjectState) =>
  [...state.projects].sort(
    (a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
  );
