/**
 * Document Card Component
 *
 * Displays agent-generated documents (docx, pptx, xlsx, pdf) in the chat.
 * Shows format-specific icon colors, file metadata, and download/share actions.
 * Uses organic daube styling per brand guidelines.
 */

import type { DocumentOutputMessage } from '@/state';
import { Text } from '@/components/ui';

/** Props for the DocumentCard component */
interface DocumentCardProps {
  /** The document output message to display */
  message: DocumentOutputMessage;
}

/** Format-specific display configuration */
interface FormatInfo {
  label: string;
  iconColor: string;
  bgColor: string;
  icon: string;
}

const FORMAT_MAP: Record<string, FormatInfo> = {
  docx: {
    label: 'Word Document',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: 'W',
  },
  pptx: {
    label: 'Presentation',
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: 'P',
  },
  xlsx: {
    label: 'Spreadsheet',
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: 'X',
  },
  pdf: {
    label: 'PDF Document',
    iconColor: 'text-coral-400',
    bgColor: 'bg-coral-500/20',
    icon: 'PDF',
  },
};

/** Format bytes into a human-readable size string. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Trigger a browser download from a blob URL. */
function downloadBlob(blobUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
}

export function DocumentCard({ message }: Readonly<DocumentCardProps>) {
  const { filename, format, size, blobUrl, title } = message.metadata;
  const formatInfo = FORMAT_MAP[format] ?? FORMAT_MAP.pdf;

  return (
    <div
      className="bg-surface-elevated p-4 max-w-[90%] rounded-organic-card shadow-organic"
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      {/* Header with format icon */}
      <div className="flex flex-row items-center mb-2">
        <div
          className={`w-10 h-10 rounded-organic-badge ${formatInfo.bgColor} flex items-center justify-center mr-3`}
        >
          <Text className={`font-mono text-sm font-bold ${formatInfo.iconColor}`}>
            {formatInfo.icon}
          </Text>
        </div>
        <div className="flex-1 min-w-0">
          <Text className="font-display text-base text-white truncate">{title}</Text>
          <Text className="font-body text-xs text-neutral-400">
            {formatInfo.label} &middot; {formatSize(size)}
          </Text>
        </div>
      </div>

      {/* Filename */}
      <Text className="font-mono text-xs text-neutral-500 mb-3 truncate">{filename}</Text>

      {/* Actions */}
      <div className="flex flex-row justify-end space-x-2 pt-2 border-t border-neutral-700">
        <button
          type="button"
          onClick={() => downloadBlob(blobUrl, filename)}
          className="px-4 py-2 bg-teal-600 active:bg-teal-700 rounded-organic-button"
          aria-label={`Download ${filename}`}
        >
          <Text className="font-body text-sm text-white font-semibold">Download</Text>
        </button>
      </div>
    </div>
  );
}
