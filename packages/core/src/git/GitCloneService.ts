/**
 * Git Clone Service
 *
 * Handles remote operations: clone, fetch, pull, push, init, cleanup.
 */

import { Directory, Filesystem } from '@capacitor/filesystem';
import git from 'isomorphic-git';

import { fs, http } from './git-fs';
import type {
  CloneOptions,
  FetchOptions,
  GitResult,
  PullOptions,
  PushOptions,
  RemoteInfo,
} from './types';

class GitCloneServiceClass {
  /**
   * Get the base directory for Git repositories
   * Returns a relative path used with Directory.Documents
   */
  getRepoBaseDir(): string {
    return 'repos';
  }

  /**
   * Clone a repository
   */
  async clone(options: CloneOptions): Promise<GitResult<void>> {
    const {
      url,
      dir,
      credentials,
      singleBranch,
      branch,
      depth,
      onProgress,
      signal: _signal,
    } = options;

    try {
      // Ensure directory exists
      await fs.promises.mkdir(dir, { recursive: true });

      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.clone({
        fs,
        http,
        dir,
        url,
        singleBranch: singleBranch ?? true,
        ref: branch,
        depth,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Clone failed',
      };
    }
  }

  /**
   * Fetch from remote
   */
  async fetch(options: FetchOptions): Promise<GitResult<void>> {
    const { dir, remote = 'origin', ref, credentials, onProgress } = options;

    try {
      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.fetch({
        fs,
        http,
        dir,
        remote,
        ref,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
      };
    }
  }

  /**
   * Pull from remote (fetch + merge/rebase)
   */
  async pull(options: PullOptions): Promise<GitResult<void>> {
    const { dir, remote = 'origin', ref, credentials, author, onProgress } = options;

    try {
      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.pull({
        fs,
        http,
        dir,
        remote,
        ref,
        author: author
          ? {
              name: author.name,
              email: author.email,
              timestamp: author.timestamp,
            }
          : undefined,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pull failed',
      };
    }
  }

  /**
   * Push to remote
   */
  async push(options: PushOptions): Promise<GitResult<void>> {
    const { dir, remote = 'origin', ref, credentials, force = false, onProgress } = options;

    try {
      const onAuth = credentials
        ? () => ({
            username: credentials.username || 'x-access-token',
            password: credentials.password,
          })
        : undefined;

      await git.push({
        fs,
        http,
        dir,
        remote,
        ref,
        force,
        onAuth,
        onProgress: onProgress
          ? (event) => {
              onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total,
                percent: event.total ? Math.round((event.loaded / event.total) * 100) : undefined,
              });
            }
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push failed',
      };
    }
  }

  /**
   * List remotes
   */
  async listRemotes(dir: string): Promise<GitResult<RemoteInfo[]>> {
    try {
      const remotes = await git.listRemotes({ fs, dir });

      return {
        success: true,
        data: remotes.map((r) => ({
          name: r.remote,
          url: r.url,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list remotes',
      };
    }
  }

  /**
   * Add a remote
   */
  async addRemote(dir: string, name: string, url: string): Promise<GitResult<void>> {
    try {
      await git.addRemote({
        fs,
        dir,
        remote: name,
        url,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add remote',
      };
    }
  }

  /**
   * Delete a remote
   */
  async deleteRemote(dir: string, name: string): Promise<GitResult<void>> {
    try {
      await git.deleteRemote({
        fs,
        dir,
        remote: name,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete remote',
      };
    }
  }

  /**
   * Initialize a new repository
   */
  async init(dir: string, defaultBranch = 'main'): Promise<GitResult<void>> {
    try {
      await fs.promises.mkdir(dir, { recursive: true });

      await git.init({
        fs,
        dir,
        defaultBranch,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize repository',
      };
    }
  }

  /**
   * Check if a directory is a Git repository
   */
  async isRepository(dir: string): Promise<boolean> {
    try {
      await git.resolveRef({
        fs,
        dir,
        ref: 'HEAD',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the HEAD commit SHA
   */
  async getHead(dir: string): Promise<GitResult<string>> {
    try {
      const oid = await git.resolveRef({
        fs,
        dir,
        ref: 'HEAD',
      });

      return { success: true, data: oid };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get HEAD',
      };
    }
  }

  /**
   * Clean up a repository (delete local clone)
   */
  async cleanup(dir: string): Promise<GitResult<void>> {
    try {
      await Filesystem.rmdir({
        path: dir,
        directory: Directory.Documents,
        recursive: true,
      });
      return { success: true };
    } catch {
      // Idempotent - consider success even if directory doesn't exist
      return { success: true };
    }
  }
}

export const GitCloneService = new GitCloneServiceClass();
