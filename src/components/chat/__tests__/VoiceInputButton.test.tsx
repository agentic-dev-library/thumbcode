import { fireEvent, render, screen } from '@testing-library/react';
import { VoiceInputButton } from '../VoiceInputButton';

const mockStartListening = vi.fn();
const mockStopListening = vi.fn();
let mockTranscript = '';
let mockIsListening = false;
let mockError: string | null = null;
let mockIsSupported = true;

vi.mock('@/hooks/use-voice-input', () => ({
  useVoiceInput: () => ({
    startListening: mockStartListening,
    stopListening: mockStopListening,
    transcript: mockTranscript,
    isListening: mockIsListening,
    error: mockError,
    isSupported: mockIsSupported,
  }),
}));

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockTranscript = '';
  mockIsListening = false;
  mockError = null;
  mockIsSupported = true;
});

describe('VoiceInputButton', () => {
  it('renders nothing when not supported', () => {
    mockIsSupported = false;
    const onTranscript = vi.fn();
    const { container } = render(<VoiceInputButton onTranscript={onTranscript} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders mic button when supported', () => {
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    expect(screen.getByLabelText('Start recording')).toBeTruthy();
  });

  it('calls startListening when mic button is clicked', () => {
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    fireEvent.click(screen.getByLabelText('Start recording'));
    expect(mockStartListening).toHaveBeenCalled();
  });

  it('calls stopListening when recording and mic button is clicked', () => {
    mockIsListening = true;
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    fireEvent.click(screen.getByLabelText('Stop recording'));
    expect(mockStopListening).toHaveBeenCalled();
  });

  it('shows transcript and Use Text button when listening with transcript', () => {
    mockIsListening = true;
    mockTranscript = 'Hello world';
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(screen.getByLabelText('Use transcript')).toBeTruthy();
  });

  it('calls onTranscript with transcript text when Use Text is clicked', () => {
    mockIsListening = true;
    mockTranscript = 'Hello world';
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    fireEvent.click(screen.getByLabelText('Use transcript'));
    expect(mockStopListening).toHaveBeenCalled();
    expect(onTranscript).toHaveBeenCalledWith('Hello world');
  });

  it('shows error message when error exists', () => {
    mockError = 'Microphone permission denied';
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Microphone permission denied')).toBeTruthy();
  });

  it('has aria-pressed attribute reflecting listening state', () => {
    mockIsListening = true;
    const onTranscript = vi.fn();
    render(<VoiceInputButton onTranscript={onTranscript} />);
    const button = screen.getByLabelText('Stop recording');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
