import { render } from '@testing-library/react';
import { PaintDaubeFilter } from '../paint-daube-filter';

describe('PaintDaubeFilter', () => {
  it('renders SVG filter with given id', () => {
    const { container } = render(
      <svg>
        <PaintDaubeFilter id="test-filter" turbulence={0.5} />
      </svg>
    );
    const filter = container.querySelector('filter');
    expect(filter).toBeInTheDocument();
    expect(filter).toHaveAttribute('id', 'test-filter');
  });

  it('applies turbulence to feTurbulence baseFrequency', () => {
    const { container } = render(
      <svg>
        <PaintDaubeFilter id="turb" turbulence={0.25} />
      </svg>
    );
    const turbulence = container.querySelector('feTurbulence');
    expect(turbulence).toBeInTheDocument();
  });

  it('applies turbulence to displacement scale', () => {
    const { container } = render(
      <svg>
        <PaintDaubeFilter id="disp" turbulence={1.0} />
      </svg>
    );
    const displacement = container.querySelector('feDisplacementMap');
    expect(displacement).toBeInTheDocument();
  });
});
