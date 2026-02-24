import { act, renderHook } from '@testing-library/react';
import { useVoiceInput } from '../use-voice-input';

let mockRecognitionInstance: {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
};

function createMockSpeechRecognitionClass() {
  return function MockSpeechRecognition(this: typeof mockRecognitionInstance) {
    this.continuous = false;
    this.interimResults = false;
    this.lang = '';
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.start = vi.fn();
    this.stop = vi.fn(function (this: typeof mockRecognitionInstance) {
      this.onend?.();
    });
    this.abort = vi.fn();
    mockRecognitionInstance = this;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'SpeechRecognition', {
    value: createMockSpeechRecognitionClass(),
    configurable: true,
    writable: true,
  });
});

describe('useVoiceInput', () => {
  it('returns initial state with isListening false', () => {
    const { result } = renderHook(() => useVoiceInput());
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.isSupported).toBe(true);
  });

  it('reports isSupported false when SpeechRecognition is unavailable', () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useVoiceInput());
    expect(result.current.isSupported).toBe(false);
  });

  it('sets error when startListening called without support', () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    expect(result.current.error).toContain('not supported');
  });

  it('starts listening and sets isListening to true', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);
    expect(mockRecognitionInstance.start).toHaveBeenCalled();
    expect(mockRecognitionInstance.continuous).toBe(true);
    expect(mockRecognitionInstance.interimResults).toBe(true);
  });

  it('stops listening and sets isListening to false', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);
    act(() => {
      result.current.stopListening();
    });
    expect(result.current.isListening).toBe(false);
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();
  });

  it('updates transcript from recognition results', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognitionInstance.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: true,
            length: 1,
            0: { transcript: 'hello world' },
          },
        },
      });
    });

    expect(result.current.transcript).toBe('hello world');
  });

  it('handles interim results', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognitionInstance.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal: false,
            length: 1,
            0: { transcript: 'hel' },
          },
        },
      });
    });

    expect(result.current.transcript).toBe('hel');
  });

  it('sets error on not-allowed error', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognitionInstance.onerror?.({ error: 'not-allowed' } as any);
    });

    expect(result.current.error).toContain('permission was denied');
    expect(result.current.isListening).toBe(false);
  });

  it('sets error on no-speech error', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognitionInstance.onerror?.({ error: 'no-speech' } as any);
    });

    expect(result.current.error).toContain('No speech detected');
  });

  it('sets error on network error', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });

    act(() => {
      mockRecognitionInstance.onerror?.({ error: 'network' } as any);
    });

    expect(result.current.error).toContain('Network error');
  });

  it('sets isListening to false on recognition end', () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      mockRecognitionInstance.onend?.();
    });

    expect(result.current.isListening).toBe(false);
  });

  it('aborts recognition on unmount', () => {
    const { result, unmount } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    unmount();
    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
  });
});
