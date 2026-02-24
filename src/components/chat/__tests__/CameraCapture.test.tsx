import { fireEvent, render, screen } from '@testing-library/react';
import { CameraCapture } from '../CameraCapture';

const mockStartCapture = vi.fn(() => Promise.resolve());
const mockStopCapture = vi.fn();
const mockTakePhoto = vi.fn(() => 'data:image/jpeg;base64,abc123');
const mockPreviewRef = { current: null };
let mockError: string | null = null;
let mockIsCapturing = false;

vi.mock('@/hooks/use-camera-capture', () => ({
  useCameraCapture: () => ({
    startCapture: mockStartCapture,
    stopCapture: mockStopCapture,
    takePhoto: mockTakePhoto,
    isCapturing: mockIsCapturing,
    previewRef: mockPreviewRef,
    error: mockError,
  }),
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockError = null;
  mockIsCapturing = false;
});

describe('CameraCapture', () => {
  it('renders with camera capture dialog', () => {
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    render(<CameraCapture onCapture={onCapture} onCancel={onCancel} />);
    expect(screen.getByRole('dialog', { name: 'Camera capture' })).toBeTruthy();
  });

  it('renders Start Camera and Cancel buttons initially', () => {
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    render(<CameraCapture onCapture={onCapture} onCancel={onCancel} />);
    expect(screen.getByLabelText('Start camera')).toBeTruthy();
    expect(screen.getByLabelText('Cancel camera')).toBeTruthy();
  });

  it('calls stopCapture and onCancel when cancel button is clicked', () => {
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    render(<CameraCapture onCapture={onCapture} onCancel={onCancel} />);

    fireEvent.click(screen.getByLabelText('Cancel camera'));
    expect(mockStopCapture).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls startCapture when Start Camera button is clicked', () => {
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    render(<CameraCapture onCapture={onCapture} onCancel={onCancel} />);

    fireEvent.click(screen.getByLabelText('Start camera'));
    expect(mockStartCapture).toHaveBeenCalled();
  });

  it('shows camera preview placeholder when not capturing', () => {
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    render(<CameraCapture onCapture={onCapture} onCancel={onCancel} />);
    expect(screen.getByText('Camera preview')).toBeTruthy();
  });

  it('renders error message when provided', () => {
    mockError = 'Camera permission was denied.';
    const onCapture = vi.fn();
    const onCancel = vi.fn();
    render(<CameraCapture onCapture={onCapture} onCancel={onCancel} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Camera permission was denied.')).toBeTruthy();
  });
});
