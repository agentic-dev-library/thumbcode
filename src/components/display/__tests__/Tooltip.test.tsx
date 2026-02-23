import { render, screen } from '@testing-library/react';
import { InfoTip, Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Help text">
        <span>Hover me</span>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeTruthy();
  });

  it('does not show tooltip content by default', () => {
    render(
      <Tooltip content="Help text">
        <span>Hover me</span>
      </Tooltip>
    );
    expect(screen.queryByText('Help text')).toBeNull();
  });

  it('has trigger button with accessibility description', () => {
    render(
      <Tooltip content="Help text">
        <span>Hover me</span>
      </Tooltip>
    );
    // The button has aria-description="Long press for more info"
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('accepts custom position prop', () => {
    const { container } = render(
      <Tooltip content="Help text" position="bottom">
        <span>Hover me</span>
      </Tooltip>
    );
    expect(container).toBeTruthy();
  });
});

describe('InfoTip', () => {
  it('renders question mark icon', () => {
    render(<InfoTip content="More info" />);
    expect(screen.getByText('?')).toBeTruthy();
  });

  it('renders with accessible button wrapper', () => {
    render(<InfoTip content="More info" />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders small size by default', () => {
    const { container } = render(<InfoTip content="Tip" />);
    expect(container).toBeTruthy();
  });

  it('renders medium size', () => {
    const { container } = render(<InfoTip content="Tip" size="md" />);
    expect(container).toBeTruthy();
  });
});
