/**
 * ImageMessage Tests
 *
 * Verifies rendering of image messages with thumbnail, lightbox,
 * loading skeleton, and error states.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import type { ImageMessage as ImageMessageType } from '@thumbcode/state';
import { ImageMessage } from '../ImageMessage';

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

function createImageMessage(
  overrides: Partial<ImageMessageType> = {},
  metaOverrides: Partial<ImageMessageType['metadata']> = {}
): ImageMessageType {
  return {
    id: 'msg-img-1',
    threadId: 'thread-1',
    sender: 'implementer',
    content: '',
    contentType: 'image',
    status: 'sent',
    timestamp: '2024-06-15T10:00:00Z',
    metadata: {
      imageUrl: 'https://example.com/photo.jpg',
      caption: 'A screenshot',
      ...metaOverrides,
    },
    ...overrides,
  };
}

describe('ImageMessage', () => {
  it('renders the image thumbnail', () => {
    render(<ImageMessage message={createImageMessage()} />);
    const img = screen.getByAltText('A screenshot');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  it('displays caption text', () => {
    render(<ImageMessage message={createImageMessage()} />);
    expect(screen.getByText('A screenshot')).toBeTruthy();
  });

  it('shows loading skeleton before image loads', () => {
    render(<ImageMessage message={createImageMessage()} />);
    expect(screen.getByTestId('image-skeleton')).toBeTruthy();
  });

  it('hides skeleton after image loads', () => {
    render(<ImageMessage message={createImageMessage()} />);
    const img = screen.getByAltText('A screenshot');
    fireEvent.load(img);
    expect(screen.queryByTestId('image-skeleton')).toBeNull();
  });

  it('shows error state when image fails to load', () => {
    render(<ImageMessage message={createImageMessage()} />);
    const img = screen.getByAltText('A screenshot');
    fireEvent.error(img);
    expect(screen.getByTestId('image-error')).toBeTruthy();
    expect(screen.getByText('Failed to load image')).toBeTruthy();
  });

  it('opens lightbox on thumbnail click', () => {
    render(<ImageMessage message={createImageMessage()} />);
    const btn = screen.getByLabelText('View full image: A screenshot');
    fireEvent.click(btn);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('Close lightbox')).toBeTruthy();
  });

  it('closes lightbox when close button is clicked', () => {
    render(<ImageMessage message={createImageMessage()} />);
    const btn = screen.getByLabelText('View full image: A screenshot');
    fireEvent.click(btn);
    expect(screen.getByRole('dialog')).toBeTruthy();

    const closeBtn = screen.getByLabelText('Close lightbox');
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes lightbox when backdrop is clicked', () => {
    render(<ImageMessage message={createImageMessage()} />);
    const btn = screen.getByLabelText('View full image: A screenshot');
    fireEvent.click(btn);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('uses attachment uri when metadata imageUrl is missing', () => {
    const msg = createImageMessage(
      {
        attachments: [
          { id: 'att-1', type: 'image', uri: 'https://example.com/attach.png', mimeType: 'image/png' },
        ],
      },
      { imageUrl: '' }
    );
    render(<ImageMessage message={msg} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('https://example.com/attach.png');
  });

  it('applies organic card styling', () => {
    const { container } = render(<ImageMessage message={createImageMessage()} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('rounded-organic-card');
    expect(card.className).toContain('shadow-organic');
    expect(card.style.transform).toBe('rotate(-0.3deg)');
  });
});
