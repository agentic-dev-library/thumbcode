/**
 * Mixed Media Message Component
 *
 * Renders messages containing multiple attachment types (images, audio, documents).
 * Provides grid layout for images and inline display for other media.
 * Uses organic daube styling per brand guidelines.
 */

import { Text } from '@/components/ui';
import type {
  DocumentOutputMessage,
  ImageMessage as ImageMessageType,
  MediaAttachment,
  Message,
  VoiceMessage,
} from '@/state';
import { AudioMessage } from './AudioMessage';
import { DocumentCard } from './DocumentCard';
import { ImageMessage } from './ImageMessage';

/** Props for the MixedMediaMessage component */
interface MixedMediaMessageProps {
  /** The mixed media message to display */
  message: Message;
}

/** Get grid column class based on image count */
function getImageGridClass(count: number): string {
  if (count === 1) return 'grid-cols-1';
  if (count <= 4) return 'grid-cols-2';
  return 'grid-cols-2 md:grid-cols-3';
}

/** Create a synthetic ImageMessage for rendering an image attachment */
function toImageMessage(attachment: MediaAttachment, baseMessage: Message): ImageMessageType {
  return {
    ...baseMessage,
    contentType: 'image',
    content: attachment.filename || '',
    metadata: {
      imageUrl: attachment.uri,
      caption: attachment.filename,
    },
  };
}

/** Create a synthetic VoiceMessage for rendering an audio attachment */
function toVoiceMessage(attachment: MediaAttachment, baseMessage: Message): VoiceMessage {
  return {
    ...baseMessage,
    contentType: 'voice_transcript',
    content: '',
    metadata: {
      audioUrl: attachment.uri,
    },
  };
}

/** Create a synthetic DocumentOutputMessage for rendering a document attachment */
function toDocumentMessage(
  attachment: MediaAttachment,
  baseMessage: Message
): DocumentOutputMessage {
  const ext = attachment.filename?.split('.').pop() || 'pdf';
  const format = (['docx', 'pptx', 'xlsx', 'pdf'].includes(ext) ? ext : 'pdf') as
    | 'docx'
    | 'pptx'
    | 'xlsx'
    | 'pdf';
  return {
    ...baseMessage,
    contentType: 'document_output',
    metadata: {
      filename: attachment.filename || 'document',
      format,
      size: attachment.size || 0,
      blobUrl: attachment.uri,
      title: attachment.filename || 'Document',
    },
  };
}

export function MixedMediaMessage({ message }: Readonly<MixedMediaMessageProps>) {
  const attachments = message.attachments || [];
  const imageAttachments = attachments.filter((a) => a.type === 'image');
  const audioAttachments = attachments.filter((a) => a.type === 'audio');
  const documentAttachments = attachments.filter((a) => a.type === 'document');
  const hasText = message.content.trim().length > 0;

  return (
    <div
      className="bg-surface-elevated p-4 max-w-[90%] rounded-organic-card shadow-organic space-y-3"
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      {/* Text content */}
      {hasText && <Text className="font-body text-sm text-neutral-200">{message.content}</Text>}

      {/* Image grid */}
      {imageAttachments.length > 0 && (
        <div
          className={`grid ${getImageGridClass(imageAttachments.length)} gap-2`}
          data-testid="image-grid"
        >
          {imageAttachments.map((attachment) => (
            <ImageMessage key={attachment.id} message={toImageMessage(attachment, message)} />
          ))}
        </div>
      )}

      {/* Audio players */}
      {audioAttachments.map((attachment) => (
        <AudioMessage key={attachment.id} message={toVoiceMessage(attachment, message)} />
      ))}

      {/* Document cards */}
      {documentAttachments.map((attachment) => (
        <DocumentCard key={attachment.id} message={toDocumentMessage(attachment, message)} />
      ))}
    </div>
  );
}
