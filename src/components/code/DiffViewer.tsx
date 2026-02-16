/**
 * DiffViewer Component
 *
 * Displays code diffs with line-by-line highlighting.
 * Supports unified and split view modes.
 */

import { useMemo, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffViewerProps {
  /** Old file content */
  oldContent?: string;
  /** New file content */
  newContent?: string;
  /** Pre-parsed diff lines */
  diff?: DiffLine[];
  /** File path */
  filename?: string;
  /** View mode */
  viewMode?: 'unified' | 'split';
  /** Show line numbers */
  showLineNumbers?: boolean;
}

export function parseDiff(oldContent: string, newContent: string): DiffLine[] {
  // Simple line-by-line diff (in production, use a proper diff library)
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const result: DiffLine[] = [];

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      result.push({
        type: 'add',
        content: newLines[newIndex],
        newLineNumber: newIndex + 1,
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      result.push({
        type: 'remove',
        content: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
      });
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
      // Lines differ - emit both remove and add
      result.push({
        type: 'remove',
        content: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
      });
      result.push({
        type: 'add',
        content: newLines[newIndex],
        newLineNumber: newIndex + 1,
      });
      oldIndex++;
      newIndex++;
    }
  }

  return result;
}

export function DiffViewer({
  oldContent,
  newContent,
  diff,
  filename,
  viewMode: _viewMode = 'unified',
  showLineNumbers = true,
}: Readonly<DiffViewerProps>) {
  const [collapsed, setCollapsed] = useState(false);

  const lines = useMemo(
    () => diff || (oldContent && newContent ? parseDiff(oldContent, newContent) : []),
    [diff, oldContent, newContent]
  );
  const [additions, deletions] = useMemo(() => {
    let adds = 0;
    let dels = 0;
    for (const line of lines) {
      if (line.type === 'add') adds++;
      else if (line.type === 'remove') dels++;
    }
    return [adds, dels];
  }, [lines]);

  const getLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case 'add':
        return 'bg-teal-600/20';
      case 'remove':
        return 'bg-coral-500/20';
      default:
        return 'bg-transparent';
    }
  };

  const getLinePrefix = (type: DiffLine['type']) => {
    switch (type) {
      case 'add':
        return '+';
      case 'remove':
        return '-';
      default:
        return ' ';
    }
  };

  const getPrefixColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'add':
        return 'text-teal-400';
      case 'remove':
        return 'text-coral-400';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div className="bg-charcoal overflow-hidden" style={organicBorderRadius.card}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex-row items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700"
        aria-label={`${filename || 'file'}, ${additions} additions, ${deletions} deletions`}
        aria-description={collapsed ? 'Expand the diff' : 'Collapse the diff'}
        aria-expanded={!collapsed}
      >
        <div className="flex-row items-center flex-1">
          <div className="mr-2" style={{ transform: `rotate(${collapsed ? '-90deg' : '0deg'})` }}>
            <ChevronDownIcon size={14} color="warmGray" turbulence={0.12} />
          </div>
          {filename && (
            <Text className="font-mono text-sm text-neutral-200" numberOfLines={1}>
              {filename}
            </Text>
          )}
        </div>
        <div className="flex-row items-center gap-2">
          {additions > 0 && <Text className="font-mono text-xs text-teal-400">+{additions}</Text>}
          {deletions > 0 && <Text className="font-mono text-xs text-coral-400">-{deletions}</Text>}
        </div>
      </button>

      {/* Content */}
      {!collapsed && (
        <div>
          <div className="min-w-full">
            {lines.map((line, index) => (
              <div key={`${line.type}-${index}`} className={`flex-row ${getLineStyle(line.type)}`}>
                {showLineNumbers && (
                  <div className="flex-row">
                    <Text className="font-mono text-xs text-neutral-600 w-10 text-right px-2 py-1 bg-neutral-900/50">
                      {line.oldLineNumber || ''}
                    </Text>
                    <Text className="font-mono text-xs text-neutral-600 w-10 text-right px-2 py-1 bg-neutral-900/50">
                      {line.newLineNumber || ''}
                    </Text>
                  </div>
                )}
                <Text className={`font-mono text-sm w-4 py-1 ${getPrefixColor(line.type)}`}>
                  {getLinePrefix(line.type)}
                </Text>
                <Text
                  className="font-mono text-sm text-neutral-200 py-1 pr-4 flex-1"
                  numberOfLines={1}
                >
                  {line.content}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
