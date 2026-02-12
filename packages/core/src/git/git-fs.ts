/**
 * Git File System Adapter
 *
 * Bridges expo-file-system with isomorphic-git for React Native compatibility.
 * Shared across all Git service modules.
 */

import * as FileSystem from 'expo-file-system';
import type { HttpClient } from 'isomorphic-git';
import { gitHttpClient } from './GitHttpClient';

// HTTP client adapter - bridges our implementation to isomorphic-git's HttpClient type
// Our implementation uses AsyncIterableIterator which works with isomorphic-git at runtime
// Using type assertion as the body types differ but are compatible at runtime
export const http = gitHttpClient as unknown as HttpClient;

/**
 * File system adapter for isomorphic-git
 * Uses expo-file-system for React Native compatibility
 */
export const fs = {
  promises: {
    readFile: async (filepath: string, options?: { encoding?: string }) => {
      const content = await FileSystem.readAsStringAsync(filepath, {
        encoding:
          options?.encoding === 'utf8'
            ? FileSystem.EncodingType.UTF8
            : FileSystem.EncodingType.Base64,
      });
      if (options?.encoding === 'utf8') {
        return content;
      }
      // Return as Buffer-like for binary files
      return Buffer.from(content, 'base64');
    },

    writeFile: async (
      filepath: string,
      data: string | Uint8Array,
      _options?: { mode?: number }
    ) => {
      const isString = typeof data === 'string';
      await FileSystem.writeAsStringAsync(
        filepath,
        isString ? data : Buffer.from(data).toString('base64'),
        {
          encoding: isString ? FileSystem.EncodingType.UTF8 : FileSystem.EncodingType.Base64,
        }
      );
    },

    unlink: async (filepath: string) => {
      await FileSystem.deleteAsync(filepath, { idempotent: true });
    },

    readdir: async (dirpath: string) => {
      const result = await FileSystem.readDirectoryAsync(dirpath);
      return result;
    },

    mkdir: async (dirpath: string, options?: { recursive?: boolean }) => {
      await FileSystem.makeDirectoryAsync(dirpath, {
        intermediates: options?.recursive ?? true,
      });
    },

    rmdir: async (dirpath: string) => {
      await FileSystem.deleteAsync(dirpath, { idempotent: true });
    },

    stat: async (filepath: string) => {
      const info = await FileSystem.getInfoAsync(filepath);
      if (!info.exists) {
        const error = new Error(`ENOENT: no such file or directory, stat '${filepath}'`);
        (error as any).code = 'ENOENT';
        throw error;
      }
      return {
        isFile: () => !info.isDirectory,
        isDirectory: () => info.isDirectory,
        isSymbolicLink: () => false,
        size: 'size' in info ? info.size : 0,
        mode: 0o644,
        mtimeMs: 'modificationTime' in info ? info.modificationTime * 1000 : 0,
        ctimeMs: 'modificationTime' in info ? info.modificationTime * 1000 : 0,
        uid: 0,
        gid: 0,
        dev: 0,
        ino: 0,
      };
    },

    lstat: async (filepath: string) => {
      // For React Native, lstat behaves same as stat
      return fs.promises.stat(filepath);
    },

    readlink: async (_filepath: string): Promise<string> => {
      // Symlinks not fully supported in React Native
      throw new Error('Symlinks not supported');
    },

    symlink: async (_target: string, _filepath: string): Promise<void> => {
      // Symlinks not fully supported in React Native
      throw new Error('Symlinks not supported');
    },

    chmod: async (_filepath: string, _mode: number): Promise<void> => {
      // chmod not applicable in React Native
      return;
    },
  },
};
