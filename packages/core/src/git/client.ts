import * as FileSystem from 'expo-file-system';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

// @ts-expect-error
git.plugins.set('fs', FileSystem);
// @ts-expect-error
git.plugins.set('http', http);

export default git;
