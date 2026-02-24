/**
 * Image Message Component
 *
 * Renders image attachments in chat messages with thumbnail preview,
 * click-to-expand lightbox, loading skeleton, and error handling.
 * Uses organic daube styling per brand guidelines.
 */

import type { ImageMessage as ImageMessageType, MediaAttachment } from '@thumbcode/state';
import { useCallback, useState } from 'react';
import { Text } from '@/components/ui';

/** Props for the ImageMessage component */
interface ImageMessageProps {
  /** The image message to display */
  message: ImageMessageType;
}

/** Loading state for individual images */
type ImageLoadState = 'loading' | 'loaded' | 'error';

/** Single image thumbnail with loading/error states */
function ImageThumbnail({
  src,
  alt,
  onClick,
}: Readonly<{ src: string; alt: string; onClick: () => void }>) {
  const [loadState, setLoadState] = useState<ImageLoadState>('loading');

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block max-w-[300px] overflow-hidden rounded-organic-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-coral-500"
      aria-label={`View full image: ${alt}`}
    >
      {loadState === 'loading' && (
        <div
          className="w-[300px] h-[200px] bg-surface-elevated animate-pulse rounded-organic-card"
          data-testid="image-skeleton"
        />
      )}
      {loadState === 'error' && (
        <div
          className="w-[300px] h-[200px] bg-surface-elevated flex items-center justify-center rounded-organic-card"
          data-testid="image-error"
        >
          <div className="text-center p-4">
            <Text className="text-coral-400 text-2xl mb-2">!</Text>
            <Text className="text-neutral-400 text-sm">Failed to load image</Text>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoadState('loaded')}
        onError={() => setLoadState('error')}
        className={`max-w-[300px] h-auto rounded-organic-card ${loadState === 'loading' ? 'absolute opacity-0' : ''} ${loadState === 'error' ? 'hidden' : ''}`}
      />
    </button>
  );
}

/** Full-screen lightbox overlay */
function Lightbox({
  src,
  alt,
  onClose,
}: Readonly<{ src: string; alt: string; onClose: () => void }>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-surface-elevated rounded-full text-white hover:bg-neutral-600 z-10"
        aria-label="Close lightbox"
      >
        <Text className="text-xl leading-none">&times;</Text>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-organic-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
    </div>
  );
}

export function ImageMessage({ message }: Readonly<ImageMessageProps>) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const imageUrl =
    message.metadata?.imageUrl ||
    message.attachments?.find((a: MediaAttachment) => a.type === 'image')?.uri ||
    '';
  const caption = message.metadata?.caption || message.content || '';
  const alt = caption || 'Image attachment';

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  return (
    <div
      className="bg-surface-elevated p-3 max-w-[90%] rounded-organic-card shadow-organic"
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      <ImageThumbnail src={imageUrl} alt={alt} onClick={openLightbox} />

      {caption && <Text className="font-body text-sm text-neutral-300 mt-2">{caption}</Text>}

      {lightboxOpen && <Lightbox src={imageUrl} alt={alt} onClose={closeLightbox} />}
    </div>
  );
}
