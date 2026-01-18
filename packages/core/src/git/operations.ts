import git from './client';
import * as FileSystem from 'expo-file-system';

const dir = FileSystem.documentDirectory;

export const clone = async (url: string, repoName: string) => {
  return git.clone({
    dir: `${dir}/${repoName}`,
    url,
    corsProxy: 'https://cors.isomorphic-git.org',
    singleBranch: true,
    depth: 1,
  });
};

export const commit = async (repoName: string, author: { name: string; email: string }, message: string) => {
  const repoDir = `${dir}/${repoName}`;
  const status = await git.statusMatrix({ dir: repoDir });

  for (const [filepath, head, workdir] of status) {
    if (workdir === 0 && head === 1) {
      await git.remove({ dir: repoDir, filepath });
    } else {
      await git.add({ dir: repoDir, filepath });
    }
  }

  const sha = await git.commit({
    dir: repoDir,
    author,
    message,
  });
  return sha;
};

export const push = async (repoName: string, token: string) => {
  return git.push({
    dir: `${dir}/${repoName}`,
    onAuth: () => ({ username: token }),
  });
};

export const status = async (repoName: string) => {
  return git.statusMatrix({
    dir: `${dir}/${repoName}`,
  });
};

export const diff = async (repoName: string, filepath: string) => {
  const repoDir = `${dir}/${repoName}`;
  try {
    const oid = await git.resolveRef({ dir: repoDir, ref: 'HEAD' });
    const { blob } = await git.readBlob({
      dir: repoDir,
      oid,
      filepath,
    });
    const oldContent = new TextDecoder().decode(blob);
    const newContent = await FileSystem.readAsStringAsync(
      `${repoDir}/${filepath}`
    );
    return { oldContent, newContent };
  } catch (e) {
    // If the file is new, readBlob will fail. In that case, the old content is empty.
    const newContent = await FileSystem.readAsStringAsync(
      `${repoDir}/${filepath}`
    );
    return { oldContent: '', newContent };
  }
};
