/**
 * PreviewPanel Component Tests
 *
 * Tests for the split-view panel with code and live preview.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { PreviewPanel } from '../PreviewPanel';

describe('PreviewPanel', () => {
  const sampleCode = 'export function Hello() { return <div>Hello</div>; }';
  const sampleHtml = '<html><body><p>Hello</p></body></html>';

  it('renders the panel with default side-by-side view', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel-code')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel-preview')).toBeInTheDocument();
  });

  it('shows all three tab buttons', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    expect(screen.getByLabelText('Show preview')).toBeInTheDocument();
    expect(screen.getByLabelText('Show code')).toBeInTheDocument();
    expect(screen.getByLabelText('Show side by side')).toBeInTheDocument();
  });

  it('switches to preview-only view when Preview tab is clicked', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    fireEvent.click(screen.getByLabelText('Show preview'));

    expect(screen.getByTestId('preview-panel-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('preview-panel-code')).not.toBeInTheDocument();
  });

  it('switches to code-only view when Code tab is clicked', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    fireEvent.click(screen.getByLabelText('Show code'));

    expect(screen.getByTestId('preview-panel-code')).toBeInTheDocument();
    expect(screen.queryByTestId('preview-panel-preview')).not.toBeInTheDocument();
  });

  it('shows side-by-side view with divider', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    // Default is side-by-side
    expect(screen.getByTestId('preview-panel-divider')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel-code')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel-preview')).toBeInTheDocument();
  });

  it('displays the source code in a pre/code element', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    expect(screen.getByText(sampleCode)).toBeInTheDocument();
  });

  it('sets data-language attribute on the code element', () => {
    render(
      <PreviewPanel code={sampleCode} previewHtml={sampleHtml} language="typescript" />
    );

    const codeEl = screen.getByText(sampleCode);
    expect(codeEl).toHaveAttribute('data-language', 'typescript');
  });

  it('renders Copy Code button and handles click', async () => {
    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    const copyBtn = screen.getByLabelText('Copy code');
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(sampleCode);
  });

  it('renders Open in New Tab button', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    expect(screen.getByLabelText('Open in new tab')).toBeInTheDocument();
  });

  it('opens preview in a new tab when button is clicked', () => {
    const openMock = vi.fn();
    vi.spyOn(window, 'open').mockImplementation(openMock);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    fireEvent.click(screen.getByLabelText('Open in new tab'));

    expect(openMock).toHaveBeenCalledWith('blob:test-url', '_blank');
  });

  it('renders the title when provided', () => {
    render(
      <PreviewPanel code={sampleCode} previewHtml={sampleHtml} title="My Component" />
    );

    // Title appears in both the panel header and the LivePreview toolbar
    const titleElements = screen.getAllByText('My Component');
    expect(titleElements.length).toBeGreaterThanOrEqual(1);
  });

  it('hides divider when not in side-by-side mode', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    fireEvent.click(screen.getByLabelText('Show code'));

    expect(screen.queryByTestId('preview-panel-divider')).not.toBeInTheDocument();
  });

  it('applies organic card styling', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    const panel = screen.getByTestId('preview-panel');
    expect(panel.className).toContain('rounded-organic-card');
    expect(panel.className).toContain('shadow-organic-card');
  });

  it('shows Copy Code button only when code pane is visible', () => {
    render(<PreviewPanel code={sampleCode} previewHtml={sampleHtml} />);

    // In side-by-side (default), Copy Code should be visible
    expect(screen.getByLabelText('Copy code')).toBeInTheDocument();

    // Switch to preview-only
    fireEvent.click(screen.getByLabelText('Show preview'));
    expect(screen.queryByLabelText('Copy code')).not.toBeInTheDocument();
  });
});
