/**
 * Camera Capture Component
 *
 * Shows a live camera preview with organic styling.
 * Provides capture/retake flow and returns the captured image
 * as a MediaAttachment.
 */

import type { MediaAttachment } from '@thumbcode/state';
import { useCallback, useState } from 'react';
import { Text } from '@/components/ui';
import { useCameraCapture } from '@/hooks/use-camera-capture';

interface CameraCaptureProps {
  onCapture: (attachment: MediaAttachment) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: Readonly<CameraCaptureProps>) {
  const { startCapture, stopCapture, takePhoto, isCapturing, previewRef, error } =
    useCameraCapture();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = useCallback(async () => {
    await startCapture();
    setHasStarted(true);
  }, [startCapture]);

  const handleCapture = useCallback(() => {
    const dataUrl = takePhoto();
    if (dataUrl) {
      stopCapture();
      setCapturedImage(dataUrl);
    }
  }, [takePhoto, stopCapture]);

  const handleRetake = useCallback(async () => {
    setCapturedImage(null);
    await startCapture();
  }, [startCapture]);

  const handleUsePhoto = useCallback(() => {
    if (!capturedImage) return;

    const attachment: MediaAttachment = {
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'image',
      uri: capturedImage,
      mimeType: 'image/jpeg',
      filename: `capture-${Date.now()}.jpg`,
    };

    onCapture(attachment);
  }, [capturedImage, onCapture]);

  const handleCancel = useCallback(() => {
    stopCapture();
    onCancel();
  }, [stopCapture, onCancel]);

  return (
    <div
      className="bg-surface rounded-organic-card shadow-organic-card p-4"
      role="dialog"
      aria-label="Camera capture"
    >
      {error && (
        <div className="mb-3 p-3 bg-coral-500/10 rounded-organic-input" role="alert">
          <Text className="font-body text-sm text-coral-500">{error}</Text>
        </div>
      )}

      {capturedImage ? (
        <div>
          <img
            src={capturedImage}
            alt="Captured photo"
            className="w-full rounded-organic-input mb-3"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 px-4 py-3 bg-neutral-700 rounded-organic-button"
              aria-label="Retake photo"
            >
              <Text className="font-body font-semibold text-white">Retake</Text>
            </button>
            <button
              type="button"
              onClick={handleUsePhoto}
              className="flex-1 px-4 py-3 bg-coral-500 rounded-organic-button"
              aria-label="Use photo"
            >
              <Text className="font-body font-semibold text-white">Use Photo</Text>
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* biome-ignore lint/a11y/useMediaCaption: live preview does not need captions */}
          <video
            ref={previewRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-organic-input mb-3 bg-neutral-800"
            style={{ minHeight: 200, display: isCapturing ? 'block' : 'none' }}
            aria-label="Camera preview"
          />
          {!isCapturing && !hasStarted && (
            <div
              className="w-full rounded-organic-input mb-3 bg-neutral-800 flex items-center justify-center"
              style={{ minHeight: 200 }}
            >
              <Text className="font-body text-neutral-500">Camera preview</Text>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-neutral-700 rounded-organic-button"
              aria-label="Cancel camera"
            >
              <Text className="font-body font-semibold text-white">Cancel</Text>
            </button>
            {isCapturing ? (
              <button
                type="button"
                onClick={handleCapture}
                className="flex-1 px-4 py-3 bg-coral-500 rounded-organic-button"
                aria-label="Take photo"
              >
                <Text className="font-body font-semibold text-white">Capture</Text>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 px-4 py-3 bg-teal-600 rounded-organic-button"
                aria-label="Start camera"
              >
                <Text className="font-body font-semibold text-white">Start Camera</Text>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
