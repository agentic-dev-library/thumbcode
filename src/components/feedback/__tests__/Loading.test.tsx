import { render } from '@testing-library/react-native';
import { LoadingOverlay, Skeleton, Spinner } from '../Loading';

jest.mock('@/lib/organic-styles', () => ({
  organicBorderRadius: { card: {} },
}));

jest.mock('@/utils/design-tokens', () => ({
  getColor: jest.fn(() => '#FF7059'),
  getColorWithOpacity: jest.fn(() => 'rgba(255,112,89,0.2)'),
}));

describe('Spinner', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<Spinner />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with label', () => {
    const { toJSON } = render(<Spinner label="Loading data..." />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Loading data...');
  });

  it('renders different sizes', () => {
    const { toJSON: sm } = render(<Spinner size="sm" />);
    const { toJSON: lg } = render(<Spinner size="lg" />);
    expect(sm()).toBeTruthy();
    expect(lg()).toBeTruthy();
  });
});

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<Skeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders as circle', () => {
    const { toJSON } = render(<Skeleton circle height={40} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { toJSON } = render(<Skeleton width={200} height={24} />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('LoadingOverlay', () => {
  it('returns null when not visible', () => {
    const { toJSON } = render(<LoadingOverlay visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders overlay with spinner when visible', () => {
    const { toJSON } = render(<LoadingOverlay visible />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders message when provided', () => {
    const { toJSON } = render(
      <LoadingOverlay visible message="Processing your request..." />
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('Processing your request...');
  });
});
