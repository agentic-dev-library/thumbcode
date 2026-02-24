/**
 * Voice Input Button Component
 *
 * Mic icon button that toggles voice recording via Web Speech API.
 * Shows a pulsing animation when recording and displays the
 * real-time transcript below the button.
 */

import { useCallback } from 'react';
import { Text } from '@/components/ui';
import { useVoiceInput } from '@/hooks/use-voice-input';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

export function VoiceInputButton({ onTranscript }: Readonly<VoiceInputButtonProps>) {
  const { startListening, stopListening, transcript, isListening, error, isSupported } =
    useVoiceInput();

  const handleToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleSendTranscript = useCallback(() => {
    if (transcript.trim()) {
      stopListening();
      onTranscript(transcript.trim());
    }
  }, [transcript, stopListening, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleToggle}
        className={`px-3 py-3 rounded-organic-button transition-all ${
          isListening
            ? 'bg-coral-500 shadow-[0_0_12px_rgba(255,112,89,0.5)] animate-pulse'
            : 'bg-neutral-700 hover:bg-neutral-600'
        }`}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
        aria-pressed={isListening}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isListening ? 'text-white' : 'text-neutral-400'}
          aria-hidden="true"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      </button>

      {error && (
        <div className="mt-2 px-2" role="alert">
          <Text className="font-body text-xs text-coral-500">{error}</Text>
        </div>
      )}

      {isListening && transcript && (
        <div className="mt-2 w-full max-w-xs" aria-live="polite">
          <div className="bg-surface rounded-organic-input p-2 mb-2">
            <Text className="font-body text-sm text-white">{transcript}</Text>
          </div>
          <button
            type="button"
            onClick={handleSendTranscript}
            className="w-full px-3 py-2 bg-teal-600 rounded-organic-button"
            aria-label="Use transcript"
          >
            <Text className="font-body text-sm font-semibold text-white">Use Text</Text>
          </button>
        </div>
      )}
    </div>
  );
}
