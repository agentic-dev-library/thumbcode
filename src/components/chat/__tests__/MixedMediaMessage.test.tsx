/**
 * MixedMediaMessage Tests
 *
 * Verifies rendering of mixed media messages with multiple
 * attachment types in correct layouts.
 */

import { render, screen } from '@testing-library/react';
import type { MediaAttachment, Message } from '@/state';
import { MixedMediaMessage } from '../MixedMediaMessage';

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

// Mock sub-components to isolate MixedMediaMessage logic
vi.mock('../ImageMessage', () => ({
  ImageMessage: ({ message }: any) => (
    <div data-testid="image-message">{message.metadata?.imageUrl || message.metadata?.caption}</div>
  ),
}));

vi.mock('../AudioMessage', () => ({
  AudioMessage: ({ message }: any) => (
    <div data-testid="audio-message">{message.metadata?.audioUrl}</div>
  ),
}));

vi.mock('../DocumentCard', () => ({
  DocumentCard: ({ message }: any) => (
    <div data-testid="document-card">{message.metadata?.filename}</div>
  ),
}));

function createMixedMessage(attachments: MediaAttachment[], content = ''): Message {
  return {
    id: 'msg-mixed-1',
    threadId: 'thread-1',
    sender: 'implementer',
    content,
    contentType: 'mixed_media',
    status: 'sent',
    timestamp: '2024-06-15T10:00:00Z',
    attachments,
  };
}

const imageAttachment = (id: string, uri: string): MediaAttachment => ({
  id,
  type: 'image',
  uri,
  mimeType: 'image/jpeg',
});

const audioAttachment = (id: string, uri: string): MediaAttachment => ({
  id,
  type: 'audio',
  uri,
  mimeType: 'audio/mp3',
});

const docAttachment = (id: string, uri: string, filename: string): MediaAttachment => ({
  id,
  type: 'document',
  uri,
  mimeType: 'application/pdf',
  filename,
  size: 1024,
});

describe('MixedMediaMessage', () => {
  it('renders text content when present', () => {
    const msg = createMixedMessage(
      [imageAttachment('img-1', 'https://example.com/1.jpg')],
      'Here is the screenshot'
    );
    render(<MixedMediaMessage message={msg} />);
    expect(screen.getByText('Here is the screenshot')).toBeTruthy();
  });

  it('renders image attachments in a grid', () => {
    const msg = createMixedMessage([
      imageAttachment('img-1', 'https://example.com/1.jpg'),
      imageAttachment('img-2', 'https://example.com/2.jpg'),
    ]);
    render(<MixedMediaMessage message={msg} />);
    const grid = screen.getByTestId('image-grid');
    expect(grid).toBeTruthy();
    expect(screen.getAllByTestId('image-message')).toHaveLength(2);
  });

  it('uses 2-column grid for 2-4 images', () => {
    const msg = createMixedMessage([
      imageAttachment('img-1', 'https://example.com/1.jpg'),
      imageAttachment('img-2', 'https://example.com/2.jpg'),
      imageAttachment('img-3', 'https://example.com/3.jpg'),
    ]);
    render(<MixedMediaMessage message={msg} />);
    const grid = screen.getByTestId('image-grid');
    expect(grid.className).toContain('grid-cols-2');
  });

  it('renders audio attachments as audio players', () => {
    const msg = createMixedMessage([audioAttachment('aud-1', 'https://example.com/voice.mp3')]);
    render(<MixedMediaMessage message={msg} />);
    expect(screen.getByTestId('audio-message')).toBeTruthy();
  });

  it('renders document attachments as document cards', () => {
    const msg = createMixedMessage([
      docAttachment('doc-1', 'blob:http://localhost/abc', 'report.pdf'),
    ]);
    render(<MixedMediaMessage message={msg} />);
    expect(screen.getByTestId('document-card')).toBeTruthy();
    expect(screen.getByText('report.pdf')).toBeTruthy();
  });

  it('renders all attachment types together', () => {
    const msg = createMixedMessage(
      [
        imageAttachment('img-1', 'https://example.com/1.jpg'),
        audioAttachment('aud-1', 'https://example.com/voice.mp3'),
        docAttachment('doc-1', 'blob:http://localhost/abc', 'spec.docx'),
      ],
      'Multiple attachments'
    );
    render(<MixedMediaMessage message={msg} />);
    expect(screen.getByText('Multiple attachments')).toBeTruthy();
    expect(screen.getByTestId('image-message')).toBeTruthy();
    expect(screen.getByTestId('audio-message')).toBeTruthy();
    expect(screen.getByTestId('document-card')).toBeTruthy();
  });

  it('does not render text section when content is empty', () => {
    const msg = createMixedMessage([imageAttachment('img-1', 'https://example.com/1.jpg')]);
    const { container } = render(<MixedMediaMessage message={msg} />);
    const card = container.firstElementChild as HTMLElement;
    // First child should be the image grid, not a text span
    expect(card.firstElementChild?.getAttribute('data-testid')).toBe('image-grid');
  });

  it('applies organic card styling', () => {
    const msg = createMixedMessage([imageAttachment('img-1', 'https://example.com/1.jpg')]);
    const { container } = render(<MixedMediaMessage message={msg} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('rounded-organic-card');
    expect(card.className).toContain('shadow-organic');
    expect(card.style.transform).toBe('rotate(-0.3deg)');
  });
});
