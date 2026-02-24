import { act, renderHook } from '@testing-library/react';
import { useCameraCapture } from '../use-camera-capture';

const mockStop = vi.fn();
const mockGetTracks = vi.fn(() => [{ stop: mockStop }]);
const mockStream = { getTracks: mockGetTracks };
const mockPlay = vi.fn(() => Promise.resolve());

function mockGetUserMedia(result: 'success' | 'denied' | 'not-found' | 'not-readable' | 'generic') {
  if (result === 'success') {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn(() => Promise.resolve(mockStream)),
      },
      configurable: true,
    });
  } else {
    const errorMap: Record<string, string> = {
      denied: 'NotAllowedError',
      'not-found': 'NotFoundError',
      'not-readable': 'NotReadableError',
      generic: 'AbortError',
    };
    const err = new DOMException('Camera error', errorMap[result]);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn(() => Promise.reject(err)),
      },
      configurable: true,
    });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStop.mockClear();
  mockGetTracks.mockClear();
  mockPlay.mockClear();
});

describe('useCameraCapture', () => {
  it('returns initial state with isCapturing false', () => {
    mockGetUserMedia('success');
    const { result } = renderHook(() => useCameraCapture());
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when getUserMedia is not available', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => useCameraCapture());
    await act(async () => {
      await result.current.startCapture();
    });
    expect(result.current.error).toBe('Camera is not supported in this browser.');
    expect(result.current.isCapturing).toBe(false);
  });

  it('starts capturing when getUserMedia succeeds', async () => {
    mockGetUserMedia('success');
    const { result } = renderHook(() => useCameraCapture());

    // Simulate a video element on the ref
    const videoEl = { srcObject: null, play: mockPlay } as unknown as HTMLVideoElement;
    Object.defineProperty(result.current.previewRef, 'current', {
      value: videoEl,
      writable: true,
    });

    await act(async () => {
      await result.current.startCapture();
    });

    expect(result.current.isCapturing).toBe(true);
    expect(result.current.error).toBeNull();
    expect(videoEl.srcObject).toBe(mockStream);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('sets error on permission denied', async () => {
    mockGetUserMedia('denied');
    const { result } = renderHook(() => useCameraCapture());
    await act(async () => {
      await result.current.startCapture();
    });
    expect(result.current.error).toContain('permission was denied');
    expect(result.current.isCapturing).toBe(false);
  });

  it('sets error when no camera found', async () => {
    mockGetUserMedia('not-found');
    const { result } = renderHook(() => useCameraCapture());
    await act(async () => {
      await result.current.startCapture();
    });
    expect(result.current.error).toContain('No camera found');
  });

  it('sets error when camera is not readable', async () => {
    mockGetUserMedia('not-readable');
    const { result } = renderHook(() => useCameraCapture());
    await act(async () => {
      await result.current.startCapture();
    });
    expect(result.current.error).toContain('already in use');
  });

  it('sets generic error for other DOMExceptions', async () => {
    mockGetUserMedia('generic');
    const { result } = renderHook(() => useCameraCapture());
    await act(async () => {
      await result.current.startCapture();
    });
    expect(result.current.error).toContain('Camera error');
  });

  it('stopCapture stops all tracks and sets isCapturing to false', async () => {
    mockGetUserMedia('success');
    const { result } = renderHook(() => useCameraCapture());

    const videoEl = { srcObject: null, play: mockPlay } as unknown as HTMLVideoElement;
    Object.defineProperty(result.current.previewRef, 'current', {
      value: videoEl,
      writable: true,
    });

    await act(async () => {
      await result.current.startCapture();
    });
    expect(result.current.isCapturing).toBe(true);

    act(() => {
      result.current.stopCapture();
    });
    expect(result.current.isCapturing).toBe(false);
    expect(mockStop).toHaveBeenCalled();
  });

  it('takePhoto returns null when not capturing', () => {
    mockGetUserMedia('success');
    const { result } = renderHook(() => useCameraCapture());
    const photo = result.current.takePhoto();
    expect(photo).toBeNull();
  });

  it('takePhoto returns a data URL when capturing', async () => {
    mockGetUserMedia('success');
    const { result } = renderHook(() => useCameraCapture());

    // Mock canvas and video
    const mockToDataURL = vi.fn(() => 'data:image/jpeg;base64,abc123');
    const mockDrawImage = vi.fn();
    const mockGetContext = vi.fn(() => ({ drawImage: mockDrawImage }));
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      width: 0,
      height: 0,
      getContext: mockGetContext,
      toDataURL: mockToDataURL,
    } as unknown as HTMLCanvasElement);

    const videoEl = {
      srcObject: null,
      play: mockPlay,
      videoWidth: 640,
      videoHeight: 480,
    } as unknown as HTMLVideoElement;
    Object.defineProperty(result.current.previewRef, 'current', {
      value: videoEl,
      writable: true,
    });

    await act(async () => {
      await result.current.startCapture();
    });

    const photo = result.current.takePhoto();
    expect(photo).toBe('data:image/jpeg;base64,abc123');
    expect(mockDrawImage).toHaveBeenCalledWith(videoEl, 0, 0);

    createElementSpy.mockRestore();
  });

  it('cleans up stream on unmount', async () => {
    mockGetUserMedia('success');
    const { result, unmount } = renderHook(() => useCameraCapture());

    const videoEl = { srcObject: null, play: mockPlay } as unknown as HTMLVideoElement;
    Object.defineProperty(result.current.previewRef, 'current', {
      value: videoEl,
      writable: true,
    });

    await act(async () => {
      await result.current.startCapture();
    });

    unmount();
    expect(mockStop).toHaveBeenCalled();
  });
});
