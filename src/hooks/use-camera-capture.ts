/**
 * Camera Capture Hook
 *
 * Provides webcam access via navigator.mediaDevices.getUserMedia.
 * Returns controls for starting/stopping capture and taking photos.
 * Captured photos are returned as base64 data URLs.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCameraCaptureResult {
  startCapture: () => Promise<void>;
  stopCapture: () => void;
  takePhoto: () => string | null;
  isCapturing: boolean;
  previewRef: React.RefObject<HTMLVideoElement | null>;
  error: string | null;
}

export function useCameraCapture(): UseCameraCaptureResult {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (previewRef.current) {
      previewRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: error handling for multiple DOMException types
  const startCapture = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        await previewRef.current.play();
      }

      setIsCapturing(true);
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError(
            'Camera permission was denied. Please allow camera access in your browser settings.'
          );
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Failed to access camera.');
      }
    }
  }, []);

  const takePhoto = useCallback((): string | null => {
    const video = previewRef.current;
    if (!video || !isCapturing) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [isCapturing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  return {
    startCapture,
    stopCapture,
    takePhoto,
    isCapturing,
    previewRef,
    error,
  };
}
