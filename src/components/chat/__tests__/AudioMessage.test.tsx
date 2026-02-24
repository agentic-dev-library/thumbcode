/**
 * AudioMessage Tests
 *
 * Verifies rendering of audio messages with custom player,
 * play/pause controls, progress, waveform, and transcript.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import type { VoiceMessage } from '@thumbcode/state';
import { AudioMessage } from '../AudioMessage';

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

// Mock HTMLAudioElement methods
const mockPlay = vi.fn(() => Promise.resolve());
const mockPause = vi.fn();

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(mockPlay);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(mockPause);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function createVoiceMessage(
  overrides: Partial<VoiceMessage> = {},
  metaOverrides: Partial<VoiceMessage['metadata']> = {}
): VoiceMessage {
  return {
    id: 'msg-voice-1',
    threadId: 'thread-1',
    sender: 'user',
    content: '',
    contentType: 'voice_transcript',
    status: 'sent',
    timestamp: '2024-06-15T10:00:00Z',
    metadata: {
      audioUrl: 'https://example.com/audio.mp3',
      duration: 45,
      ...metaOverrides,
    },
    ...overrides,
  };
}

describe('AudioMessage', () => {
  it('renders play button', () => {
    render(<AudioMessage message={createVoiceMessage()} />);
    expect(screen.getByLabelText('Play audio')).toBeTruthy();
  });

  it('calls audio play on play button click', () => {
    render(<AudioMessage message={createVoiceMessage()} />);
    const playBtn = screen.getByLabelText('Play audio');
    fireEvent.click(playBtn);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('shows pause button after clicking play', () => {
    render(<AudioMessage message={createVoiceMessage()} />);
    const playBtn = screen.getByLabelText('Play audio');
    fireEvent.click(playBtn);
    expect(screen.getByLabelText('Pause audio')).toBeTruthy();
  });

  it('calls audio pause on pause button click', () => {
    render(<AudioMessage message={createVoiceMessage()} />);
    fireEvent.click(screen.getByLabelText('Play audio'));
    fireEvent.click(screen.getByLabelText('Pause audio'));
    expect(mockPause).toHaveBeenCalled();
  });

  it('displays duration from metadata', () => {
    const { container } = render(<AudioMessage message={createVoiceMessage()} />);
    expect(container.innerHTML).toContain('0:45');
  });

  it('displays initial time as 0:00', () => {
    const { container } = render(<AudioMessage message={createVoiceMessage()} />);
    expect(container.innerHTML).toContain('0:00');
  });

  it('renders waveform bars', () => {
    render(<AudioMessage message={createVoiceMessage()} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    // Should have 20 bars
    expect(progressbar.children.length).toBe(20);
  });

  it('renders transcript when content is present', () => {
    const msg = createVoiceMessage({ content: 'Hello world from voice' });
    render(<AudioMessage message={msg} />);
    expect(screen.getByText('Transcript')).toBeTruthy();
    expect(screen.getByText('Hello world from voice')).toBeTruthy();
  });

  it('does not render transcript section when content is empty', () => {
    render(<AudioMessage message={createVoiceMessage()} />);
    expect(screen.queryByText('Transcript')).toBeNull();
  });

  it('applies organic card styling', () => {
    const { container } = render(<AudioMessage message={createVoiceMessage()} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('rounded-organic-card');
    expect(card.className).toContain('shadow-organic');
    expect(card.style.transform).toBe('rotate(-0.3deg)');
  });

  it('uses attachment uri when metadata audioUrl is missing', () => {
    const msg = createVoiceMessage(
      {
        attachments: [
          {
            id: 'att-1',
            type: 'audio',
            uri: 'https://example.com/voice.ogg',
            mimeType: 'audio/ogg',
          },
        ],
      },
      { audioUrl: undefined }
    );
    const { container } = render(<AudioMessage message={msg} />);
    const audio = container.querySelector('audio');
    expect(audio?.getAttribute('src')).toBe('https://example.com/voice.ogg');
  });
});
