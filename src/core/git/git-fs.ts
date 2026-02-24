/**
 * Git File System Adapter
 *
 * Bridges @capacitor/filesystem with isomorphic-git for Capacitor compatibility.
 * Shared across all Git service modules.
 */

import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { HttpClient } from 'isomorphic-git';
import { gitHttpClient } from './GitHttpClient';

// HTTP client adapter - bridges our implementation to isomorphic-git's HttpClient type
// Our implementation uses AsyncIterableIterator which works with isomorphic-git at runtime
// Using type assertion as the body types differ but are compatible at runtime
export const http = gitHttpClient as unknown as HttpClient;

/**
 * File system adapter for isomorphic-git
 * Uses @capacitor/filesystem for Capacitor compatibility
 */
export const fs = {
  promises: {
    readFile: async (filepath: string, options?: { encoding?: string }) => {
      const result = await Filesystem.readFile({
        path: filepath,
        directory: Directory.Documents,
        encoding: options?.encoding === 'utf8' ? Encoding.UTF8 : undefined, // undefined = base64 in Capacitor
      });
      if (options?.encoding === 'utf8') {
        return result.data as string;
      }
      // Return as Buffer-like for binary files (data is base64 string when no encoding)
      return Buffer.from(result.data as string, 'base64');
    },

    writeFile: async (
      filepath: string,
      data: string | Uint8Array,
      _options?: { mode?: number }
    ) => {
      const isString = typeof data === 'string';
      await Filesystem.writeFile({
        path: filepath,
        data: isString ? data : Buffer.from(data).toString('base64'),
        directory: Directory.Documents,
        encoding: isString ? Encoding.UTF8 : undefined,
        recursive: true,
      });
    },

    unlink: async (filepath: string) => {
      try {
        await Filesystem.deleteFile({
          path: filepath,
          directory: Directory.Documents,
        });
      } catch {
        // Idempotent delete - ignore if not found
      }
    },

    readdir: async (dirpath: string) => {
      const result = await Filesystem.readdir({
        path: dirpath,
        directory: Directory.Documents,
      });
      return result.files.map((f) => f.name);
    },

    mkdir: async (dirpath: string, options?: { recursive?: boolean }) => {
      await Filesystem.mkdir({
        path: dirpath,
        directory: Directory.Documents,
        recursive: options?.recursive ?? true,
      });
    },

    rmdir: async (dirpath: string) => {
      try {
        await Filesystem.rmdir({
          path: dirpath,
          directory: Directory.Documents,
          recursive: true,
        });
      } catch {
        // Idempotent delete - ignore if not found
      }
    },

    stat: async (filepath: string) => {
      try {
        const info = await Filesystem.stat({
          path: filepath,
          directory: Directory.Documents,
        });
        return {
          isFile: () => info.type === 'file',
          isDirectory: () => info.type === 'directory',
          isSymbolicLink: () => false,
          size: info.size || 0,
          mode: 0o644,
          mtimeMs: info.mtime ? new Date(info.mtime).getTime() : 0,
          ctimeMs: info.ctime ? new Date(info.ctime).getTime() : 0,
          uid: 0,
          gid: 0,
          dev: 0,
          ino: 0,
        };
      } catch {
        const error = new Error(`ENOENT: no such file or directory, stat '${filepath}'`);
        (error as any).code = 'ENOENT';
        throw error;
      }
    },

    lstat: async (filepath: string) => {
      // For Capacitor, lstat behaves same as stat
      return fs.promises.stat(filepath);
    },

    readlink: async (_filepath: string): Promise<string> => {
      // Symlinks not fully supported in Capacitor mobile
      throw new Error('Symlinks not supported');
    },

    symlink: async (_target: string, _filepath: string): Promise<void> => {
      // Symlinks not fully supported in Capacitor mobile
      throw new Error('Symlinks not supported');
    },

    chmod: async (_filepath: string, _mode: number): Promise<void> => {
      // chmod not applicable in Capacitor mobile
      return;
    },
  },
};
