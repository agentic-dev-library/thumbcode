/**
 * LivePreview Component Tests
 *
 * Tests for the sandboxed iframe preview component.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { LivePreview } from '../LivePreview';

describe('LivePreview', () => {
  const sampleHtml = '<html><body><p>Hello Preview</p></body></html>';

  it('renders the iframe with srcdoc', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('srcdoc', sampleHtml);
  });

  it('sets sandbox attribute to allow-scripts only', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  });

  it('does NOT include allow-same-origin in sandbox', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    expect(sandbox).not.toContain('allow-same-origin');
  });

  it('renders with the provided title', () => {
    render(<LivePreview html={sampleHtml} title="My Preview" />);

    const iframe = screen.getByTestId('live-preview-iframe');
    expect(iframe).toHaveAttribute('title', 'My Preview');
    expect(screen.getByText('My Preview')).toBeInTheDocument();
  });

  it('applies custom height to the iframe', () => {
    render(<LivePreview html={sampleHtml} height={500} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    expect(iframe.style.height).toBe('500px');
  });

  it('shows loading state initially', () => {
    render(<LivePreview html={sampleHtml} />);

    expect(screen.getByTestId('live-preview-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading preview...')).toBeInTheDocument();
  });

  it('hides loading state after iframe loads', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    fireEvent.load(iframe);

    expect(screen.queryByTestId('live-preview-loading')).not.toBeInTheDocument();
  });

  it('shows error state on iframe error', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    // Manually dispatch an error event since jsdom doesn't fully support iframe error
    act(() => {
      iframe.dispatchEvent(new Event('error', { bubbles: false }));
    });

    expect(screen.getByTestId('live-preview-error')).toBeInTheDocument();
    expect(screen.getByText('Preview failed to load')).toBeInTheDocument();
  });

  it('provides a refresh button that re-renders the iframe', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    fireEvent.load(iframe);

    const refreshBtn = screen.getByLabelText('Refresh preview');
    fireEvent.click(refreshBtn);

    // Loading should reappear after refresh
    expect(screen.getByTestId('live-preview-loading')).toBeInTheDocument();
  });

  it('provides a retry button in error state', () => {
    render(<LivePreview html={sampleHtml} />);

    const iframe = screen.getByTestId('live-preview-iframe');
    act(() => {
      iframe.dispatchEvent(new Event('error', { bubbles: false }));
    });

    const retryBtn = screen.getByLabelText('Retry preview');
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    // After retry, loading should appear again
    expect(screen.getByTestId('live-preview-loading')).toBeInTheDocument();
  });

  it('renders empty state when html is empty', () => {
    render(<LivePreview html="" />);

    expect(screen.getByTestId('live-preview-empty')).toBeInTheDocument();
    expect(screen.getByText('No preview content available')).toBeInTheDocument();
  });

  it('applies additional className to the container', () => {
    render(<LivePreview html={sampleHtml} className="my-custom-class" />);

    const container = screen.getByTestId('live-preview-container');
    expect(container.className).toContain('my-custom-class');
  });
});
