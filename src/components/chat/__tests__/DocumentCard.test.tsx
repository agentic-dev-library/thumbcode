/**
 * DocumentCard Tests
 *
 * Verifies rendering of agent-generated document cards in the chat.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import type { DocumentOutputMessage } from '@/state';
import { DocumentCard } from '../DocumentCard';

vi.mock('@/components/ui', () => ({
  Text: ({ children, ...props }: { children?: React.ReactNode; className?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

function createDocMessage(
  overrides: Partial<DocumentOutputMessage['metadata']> = {}
): DocumentOutputMessage {
  return {
    id: 'msg-doc-1',
    threadId: 'thread-1',
    sender: 'implementer',
    content: 'Generated document',
    contentType: 'document_output',
    status: 'sent',
    timestamp: '2024-06-15T10:00:00Z',
    metadata: {
      filename: 'report.docx',
      format: 'docx',
      size: 15360,
      blobUrl: 'blob:http://localhost/abc123',
      title: 'Quarterly Report',
      ...overrides,
    },
  };
}

describe('DocumentCard', () => {
  it('renders the document title', () => {
    render(<DocumentCard message={createDocMessage()} />);
    expect(screen.getByText('Quarterly Report')).toBeTruthy();
  });

  it('renders the filename', () => {
    render(<DocumentCard message={createDocMessage()} />);
    expect(screen.getByText('report.docx')).toBeTruthy();
  });

  it('renders the format label for docx', () => {
    render(<DocumentCard message={createDocMessage({ format: 'docx' })} />);
    expect(screen.getByText('W')).toBeTruthy();
  });

  it('renders the format label for pptx', () => {
    render(<DocumentCard message={createDocMessage({ format: 'pptx', filename: 'deck.pptx' })} />);
    expect(screen.getByText('P')).toBeTruthy();
  });

  it('renders the format label for xlsx', () => {
    render(<DocumentCard message={createDocMessage({ format: 'xlsx', filename: 'data.xlsx' })} />);
    expect(screen.getByText('X')).toBeTruthy();
  });

  it('renders the format label for pdf', () => {
    render(<DocumentCard message={createDocMessage({ format: 'pdf', filename: 'doc.pdf' })} />);
    expect(screen.getByText('PDF')).toBeTruthy();
  });

  it('formats file size correctly in KB', () => {
    render(<DocumentCard message={createDocMessage({ size: 15360 })} />);
    // 15360 bytes = 15.0 KB
    const { container } = render(<DocumentCard message={createDocMessage({ size: 15360 })} />);
    expect(container.innerHTML).toContain('15.0 KB');
  });

  it('formats file size correctly in MB', () => {
    const { container } = render(
      <DocumentCard message={createDocMessage({ size: 2 * 1024 * 1024 })} />
    );
    expect(container.innerHTML).toContain('2.0 MB');
  });

  it('formats file size correctly in bytes', () => {
    const { container } = render(<DocumentCard message={createDocMessage({ size: 512 })} />);
    expect(container.innerHTML).toContain('512 B');
  });

  it('renders download button', () => {
    render(<DocumentCard message={createDocMessage()} />);
    expect(screen.getByText('Download')).toBeTruthy();
  });

  it('triggers download on button click without errors', () => {
    render(<DocumentCard message={createDocMessage()} />);
    const downloadBtn = screen.getByText('Download');
    // Click should not throw
    expect(() => fireEvent.click(downloadBtn)).not.toThrow();
  });

  it('has accessible download button label', () => {
    render(<DocumentCard message={createDocMessage()} />);
    const btn = screen.getByLabelText('Download report.docx');
    expect(btn).toBeTruthy();
  });
});
