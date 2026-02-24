import { render } from '@testing-library/react';
import { Divider } from '../Divider';

vi.mock('@/utils/design-tokens', () => ({
  getColor: vi.fn((_group: string, shade: string) => `#${shade}`),
}));

describe('Divider', () => {
  it('renders horizontal by default', () => {
    const { container } = render(<Divider />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('1px');
    expect(el.style.width).toBe('100%');
  });

  it('renders vertical orientation', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('1px');
    expect(el.style.height).toBe('100%');
  });

  it('applies spacing none', () => {
    const { container } = render(<Divider spacing="none" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.marginTop).toBe('0px');
    expect(el.style.marginBottom).toBe('0px');
  });

  it('applies spacing sm', () => {
    const { container } = render(<Divider spacing="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.marginTop).toBe('8px');
    expect(el.style.marginBottom).toBe('8px');
  });

  it('applies spacing lg', () => {
    const { container } = render(<Divider spacing="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.marginTop).toBe('24px');
  });

  it('applies custom className', () => {
    const { container } = render(<Divider className="my-class" />);
    expect(container.querySelector('.my-class')).toBeInTheDocument();
  });
});
