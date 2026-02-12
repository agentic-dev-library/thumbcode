import fs from 'fs';
import path from 'path';
import os from 'os';
// Mock expo-crypto before importing GitService
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(async () => 'mock-hash'),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

import { GitService } from '../git/GitService';
import * as FileSystem from 'expo-file-system';

// Mock expo-file-system
const tempDir = path.join(os.tmpdir(), 'git-service-perf-test-' + Date.now());
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// We need to mock documentDirectory to point to our tempDir
// and mock the async methods to use fs.promises
jest.mock('expo-file-system', () => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  // We can't access closure variables in jest.mock factory unless we use doMock or specific setup
  // but we can define the temp dir logic inside or rely on a known path if needed.
  // For simplicity, we'll assume a path relative to the test or use a global.
  // Actually, let's use a fixed path structure for the mock or communicate via a module.
  // But jest.mock is hoisted.

  // To avoid complexity, we'll make the mock robust enough to handle absolute paths
  // and we'll set documentDirectory to a known temp path in the test setup if possible,
  // but documentDirectory is a constant. We can mock it to a fixed value.

  const MOCK_DOC_DIR = path.join(os.tmpdir(), 'git-service-perf-root');
  if (!fs.existsSync(MOCK_DOC_DIR)) {
      fs.mkdirSync(MOCK_DOC_DIR, { recursive: true });
  }

  return {
    documentDirectory: MOCK_DOC_DIR + '/', // expo expects trailing slash usually
    readAsStringAsync: jest.fn(async (filepath, options) => {
      const encoding = options?.encoding === 'utf8' ? 'utf8' : 'base64';
      return fs.promises.readFile(filepath, { encoding });
    }),
    writeAsStringAsync: jest.fn(async (filepath, content, options) => {
      const encoding = options?.encoding === 'utf8' ? 'utf8' : 'base64';
      // If base64, buffer it
      const data = encoding === 'base64' ? Buffer.from(content, 'base64') : content;
      await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
      return fs.promises.writeFile(filepath, data);
    }),
    deleteAsync: jest.fn(async (filepath) => {
      if (fs.existsSync(filepath)) {
        await fs.promises.rm(filepath, { recursive: true, force: true });
      }
    }),
    readDirectoryAsync: jest.fn(async (dirpath) => {
      return fs.promises.readdir(dirpath);
    }),
    makeDirectoryAsync: jest.fn(async (dirpath, options) => {
      return fs.promises.mkdir(dirpath, { recursive: options?.intermediates });
    }),
    getInfoAsync: jest.fn(async (filepath) => {
      try {
        const stats = await fs.promises.stat(filepath);
        return {
          exists: true,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modificationTime: stats.mtimeMs / 1000,
        };
      } catch (e) {
        return { exists: false, isDirectory: false };
      }
    }),
    EncodingType: {
      UTF8: 'utf8',
      Base64: 'base64',
    },
  };
});

describe('GitService Performance', () => {
  const repoName = 'perf-repo-' + Date.now();
  const repoDir = path.join(FileSystem.documentDirectory as string, 'repos', repoName);

  beforeAll(async () => {
      // Clean up before starting
      await FileSystem.deleteAsync(repoDir);
  });

  afterAll(async () => {
    // Clean up after finishing
    await FileSystem.deleteAsync(repoDir);
  });

  it('measures diff performance with many files', async () => {
    // 1. Initialize repo
    const initResult = await GitService.init(repoDir);
    if (!initResult.success) {
      console.error('Init failed:', initResult.error);
    }
    expect(initResult.success).toBe(true);

    // 2. Create initial files
    const fileCount = 100;
    const files = [];
    for (let i = 0; i < fileCount; i++) {
      files.push(`file-${i}.txt`);
      await FileSystem.writeAsStringAsync(
        path.join(repoDir, `file-${i}.txt`),
        `Initial content for file ${i}\nLine 2\nLine 3`,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    }

    // 3. Stage and commit
    const stage1 = await GitService.stage({ dir: repoDir, filepath: files });
    expect(stage1.success).toBe(true);
    const commit1 = await GitService.commit({
      dir: repoDir,
      message: 'Initial commit',
      author: { name: 'Test User', email: 'test@example.com', timestamp: Math.floor(Date.now() / 1000) },
    });
    expect(commit1.success).toBe(true);

    // 4. Modify all files
    for (let i = 0; i < fileCount; i++) {
      await FileSystem.writeAsStringAsync(
        path.join(repoDir, `file-${i}.txt`),
        `Initial content for file ${i}\nLine 2 MODIFIED\nLine 3\nLine 4 ADDED`,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    }

    // 5. Stage and commit
    const stage2 = await GitService.stage({ dir: repoDir, filepath: files });
    expect(stage2.success).toBe(true);
    const commit2 = await GitService.commit({
      dir: repoDir,
      message: 'Modify files',
      author: { name: 'Test User', email: 'test@example.com', timestamp: Math.floor(Date.now() / 1000) },
    });
    expect(commit2.success).toBe(true);

    expect(commit1.data).not.toBe(commit2.data);

    // 6. Measure diff time
    const start = performance.now();
    const diffResult = await GitService.diff(repoDir, commit1.data!, commit2.data!);
    const end = performance.now();

    expect(diffResult.success).toBe(true);
    expect(diffResult.data?.files.length).toBe(fileCount);

    console.log(`GitService.diff for ${fileCount} files took ${(end - start).toFixed(2)}ms`);
  }, 30000); // Increase timeout
});
