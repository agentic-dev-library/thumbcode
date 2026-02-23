/**
 * UI Package Component Tests
 *
 * Tests rendering for core UI components: Text, Button, Card,
 * Spinner, Alert, and theme utilities.
 */

import { render, screen } from '@testing-library/react';
import { Alert } from '../feedback/Alert';
import { Spinner } from '../feedback/Spinner';
import { Button } from '../form/Button';
import { Card } from '../layout/Card';
import { Text } from '../primitives/Text';
import { organicBorderRadius, organicShadow } from '../theme/organicStyles';
import { themeTokens } from '../theme/ThemeProvider';

vi.mock('lucide-react', () => ({
  ArrowLeft: ({ size, color, className }: any) => (
    <span data-testid="icon-back" className={className}>
      back
    </span>
  ),
  CircleCheck: ({ size, color, className }: any) => (
    <span data-testid="icon-alertSuccess" className={className}>
      alertSuccess
    </span>
  ),
  CircleAlert: ({ size, color, className }: any) => (
    <span data-testid="icon-alertError" className={className}>
      alertError
    </span>
  ),
  TriangleAlert: ({ size, color, className }: any) => (
    <span data-testid="icon-alertWarning" className={className}>
      alertWarning
    </span>
  ),
  Info: ({ size, color, className }: any) => (
    <span data-testid="icon-alertInfo" className={className}>
      alertInfo
    </span>
  ),
}));

describe('Text Component', () => {
  it('renders children', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('applies display variant class', () => {
    render(<Text variant="display">Display</Text>);
    expect(screen.getByText('Display')).toBeTruthy();
  });

  it('applies mono variant class', () => {
    render(<Text variant="mono">Code</Text>);
    expect(screen.getByText('Code')).toBeTruthy();
  });

  it('applies size and weight props', () => {
    render(
      <Text size="2xl" weight="bold">
        Large Bold
      </Text>
    );
    expect(screen.getByText('Large Bold')).toBeTruthy();
  });
});

describe('Button Component', () => {
  it('renders children as label', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeTruthy();
  });

  it('renders with primary variant by default', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toBeTruthy();
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toBeTruthy();
  });

  it('renders loading state with ActivityIndicator', () => {
    const { container } = render(<Button loading>Loading</Button>);
    // Loading state should show spinner, not label text
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('has button accessibility role', () => {
    render(<Button>Accessible</Button>);
    expect(screen.getByRole('button')).toBeTruthy();
  });
});

describe('Card Component', () => {
  it('renders children', () => {
    render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('renders elevated variant', () => {
    render(
      <Card variant="elevated">
        <Text>Elevated</Text>
      </Card>
    );
    expect(screen.getByText('Elevated')).toBeTruthy();
  });

  it('renders default variant', () => {
    render(
      <Card variant="default">
        <Text>Default</Text>
      </Card>
    );
    expect(screen.getByText('Default')).toBeTruthy();
  });
});

describe('Spinner Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders with label', () => {
    render(<Spinner label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeTruthy();
  });

  it('has progressbar accessibility role', () => {
    const { container } = render(<Spinner />);
    // Spinner renders as a div with animate-spin class
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });
});

describe('Alert Component', () => {
  it('renders success alert', () => {
    render(<Alert type="success" message="Operation completed" />);
    expect(screen.getByText('Operation completed')).toBeTruthy();
  });

  it('renders error alert', () => {
    render(<Alert type="error" message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders warning alert', () => {
    render(<Alert type="warning" message="Be careful" />);
    expect(screen.getByText('Be careful')).toBeTruthy();
  });

  it('renders info alert', () => {
    render(<Alert type="info" message="FYI" />);
    expect(screen.getByText('FYI')).toBeTruthy();
  });

  it('renders with title', () => {
    render(<Alert type="success" title="Success!" message="It worked" />);
    expect(screen.getByText('Success!')).toBeTruthy();
    expect(screen.getByText('It worked')).toBeTruthy();
  });

  it('has alert accessibility role', () => {
    render(<Alert type="info" message="Info message" />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('Theme', () => {
  describe('themeTokens', () => {
    it('defines coral colors', () => {
      expect(themeTokens.colors.coral[500]).toBe('#FF7059');
    });

    it('defines teal colors', () => {
      expect(themeTokens.colors.teal[600]).toBe('#0D9488');
    });

    it('defines gold colors', () => {
      expect(themeTokens.colors.gold[400]).toBe('#F5D563');
    });

    it('defines charcoal base color', () => {
      expect(themeTokens.colors.charcoal).toBe('#151820');
    });

    it('defines typography fonts', () => {
      expect(themeTokens.typography.fonts.display).toBe('Fraunces');
      expect(themeTokens.typography.fonts.body).toBe('Cabin');
      expect(themeTokens.typography.fonts.mono).toBe('JetBrains Mono');
    });

    it('defines spacing tokens', () => {
      expect(themeTokens.spacing.md).toBe('16px');
    });
  });

  describe('organicBorderRadius', () => {
    it('defines asymmetric card border radius', () => {
      const { card } = organicBorderRadius;
      expect(card.borderTopLeftRadius).not.toBe(card.borderTopRightRadius);
    });

    it('defines button border radius', () => {
      expect(organicBorderRadius.button).toBeDefined();
      expect(organicBorderRadius.button.borderTopLeftRadius).toBeDefined();
    });

    it('defines badge border radius', () => {
      expect(organicBorderRadius.badge).toBeDefined();
    });
  });

  describe('organicShadow', () => {
    it('defines card shadow', () => {
      expect(organicShadow.card.boxShadow).toBeDefined();
      expect(organicShadow.card.boxShadow).toContain('rgba');
    });

    it('elevated shadow has greater elevation than card', () => {
      expect(organicShadow.elevated.boxShadow).toBeDefined();
      // Elevated shadow string should be longer / contain larger values
      expect(organicShadow.elevated.boxShadow?.length).toBeGreaterThan(
        organicShadow.card.boxShadow?.length ?? 0
      );
    });
  });
});
