/**
 * Audio Message Component
 *
 * Custom audio player for voice messages in the chat.
 * Features play/pause, waveform visualization, progress bar,
 * duration display, and optional transcript.
 * Uses organic daube styling per brand guidelines.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from '@/components/ui';
import type { MediaAttachment, VoiceMessage } from '@/state';

/** Props for the AudioMessage component */
interface AudioMessageProps {
  /** The voice/audio message to display */
  message: VoiceMessage;
}

/** Format seconds into mm:ss display */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Static waveform bar heights (pseudo-random pattern) */
const WAVEFORM_BARS = [
  { id: 'w0', h: 0.3 },
  { id: 'w1', h: 0.6 },
  { id: 'w2', h: 0.8 },
  { id: 'w3', h: 0.5 },
  { id: 'w4', h: 0.9 },
  { id: 'w5', h: 0.4 },
  { id: 'w6', h: 0.7 },
  { id: 'w7', h: 1.0 },
  { id: 'w8', h: 0.6 },
  { id: 'w9', h: 0.3 },
  { id: 'w10', h: 0.7 },
  { id: 'w11', h: 0.5 },
  { id: 'w12', h: 0.8 },
  { id: 'w13', h: 0.4 },
  { id: 'w14', h: 0.6 },
  { id: 'w15', h: 0.9 },
  { id: 'w16', h: 0.5 },
  { id: 'w17', h: 0.7 },
  { id: 'w18', h: 0.3 },
  { id: 'w19', h: 0.8 },
];

export function AudioMessage({ message }: Readonly<AudioMessageProps>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.metadata?.duration || 0);

  const audioUrl =
    message.metadata?.audioUrl ||
    message.attachments?.find((a: MediaAttachment) => a.type === 'audio')?.uri ||
    '';
  const transcript = message.content || '';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      audio.currentTime = fraction * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="bg-surface-elevated p-4 max-w-[90%] rounded-organic-card shadow-organic"
      style={{ transform: 'rotate(-0.3deg)' }}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: audio player has visual transcript below */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          type="button"
          onClick={togglePlayPause}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-coral-500 active:bg-coral-600 rounded-full"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white" aria-hidden="true">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white" aria-hidden="true">
              <path d="M3 1.5v11l9-5.5z" />
            </svg>
          )}
        </button>

        {/* Waveform + Progress */}
        <div className="flex-1 min-w-0">
          {/* Waveform bars */}
          <div
            className="flex items-end gap-[2px] h-8 cursor-pointer"
            onClick={handleProgressClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePlayPause();
              }
            }}
            role="progressbar"
            aria-label="Audio progress"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
          >
            {WAVEFORM_BARS.map((bar, barIndex) => {
              const barProgress = (barIndex / WAVEFORM_BARS.length) * 100;
              const isActive = barProgress < progress;
              return (
                <div
                  key={bar.id}
                  className={`flex-1 rounded-sm transition-colors ${isActive ? 'bg-coral-500' : 'bg-neutral-600'}`}
                  style={{ height: `${bar.h * 100}%` }}
                />
              );
            })}
          </div>

          {/* Duration display */}
          <div className="flex justify-between mt-1">
            <Text className="font-mono text-xs text-neutral-400">
              {formatDuration(currentTime)}
            </Text>
            <Text className="font-mono text-xs text-neutral-400">{formatDuration(duration)}</Text>
          </div>
        </div>
      </div>

      {/* Transcript text */}
      {transcript && (
        <div className="mt-3 pt-3 border-t border-neutral-700">
          <Text className="font-body text-xs text-neutral-500 mb-1">Transcript</Text>
          <Text className="font-body text-sm text-neutral-300">{transcript}</Text>
        </div>
      )}
    </div>
  );
}
