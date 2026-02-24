import { render, screen } from '@testing-library/react';
import { HStack, Stack, VStack } from '../Stack';

describe('Stack', () => {
  it('renders children', () => {
    render(<Stack>Content</Stack>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies column direction by default', () => {
    const { container } = render(<Stack>Content</Stack>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });

  it('applies row direction', () => {
    const { container } = render(<Stack direction="row">Content</Stack>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'row' });
  });

  it('applies numeric spacing as gap', () => {
    const { container } = render(<Stack spacing={10}>Content</Stack>);
    expect(container.firstChild).toHaveStyle({ gap: '10px' });
  });

  it('applies named spacing as gap', () => {
    const { container } = render(<Stack spacing="lg">Content</Stack>);
    expect(container.firstChild).toHaveStyle({ gap: '24px' });
  });

  it('applies align prop', () => {
    const { container } = render(<Stack align="center">Content</Stack>);
    expect(container.firstChild).toHaveStyle({ alignItems: 'center' });
  });

  it('applies justify prop', () => {
    const { container } = render(<Stack justify="between">Content</Stack>);
    expect(container.firstChild).toHaveStyle({ justifyContent: 'space-between' });
  });

  it('applies wrap prop', () => {
    const { container } = render(<Stack wrap>Content</Stack>);
    expect(container.firstChild).toHaveStyle({ flexWrap: 'wrap' });
  });

  it('applies flex prop', () => {
    const { container } = render(<Stack flex={1}>Content</Stack>);
    expect(container.firstChild).toHaveStyle({ flex: '1' });
  });

  it('applies className', () => {
    const { container } = render(<Stack className="custom">Content</Stack>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies inline style', () => {
    const { container } = render(
      <Stack style={{ backgroundColor: 'red' }}>Content</Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('red');
  });

  it('flattens array styles', () => {
    const { container } = render(
      <Stack style={[{ color: 'red' }, { backgroundColor: 'blue' }]}>Content</Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.color).toBe('red');
    expect(el.style.backgroundColor).toBe('blue');
  });
});

describe('HStack', () => {
  it('renders with row direction', () => {
    const { container } = render(<HStack>Content</HStack>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'row' });
  });
});

describe('VStack', () => {
  it('renders with column direction', () => {
    const { container } = render(<VStack>Content</VStack>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });
});
