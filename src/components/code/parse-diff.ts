export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function parseDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const result: DiffLine[] = [];
  let oldIndex = 0;
  let newIndex = 0;
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      result.push({ type: 'add', content: newLines[newIndex], newLineNumber: newIndex + 1 });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      result.push({ type: 'remove', content: oldLines[oldIndex], oldLineNumber: oldIndex + 1 });
      oldIndex++;
    } else if (oldLines[oldIndex] === newLines[newIndex]) {
      result.push({
        type: 'context',
        content: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
      });
      oldIndex++;
      newIndex++;
    } else {
      result.push({ type: 'remove', content: oldLines[oldIndex], oldLineNumber: oldIndex + 1 });
      result.push({ type: 'add', content: newLines[newIndex], newLineNumber: newIndex + 1 });
      oldIndex++;
      newIndex++;
    }
  }
  return result;
}
