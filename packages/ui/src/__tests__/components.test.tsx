/**
 * UI Package Component Tests
 *
 * Tests rendering for core UI components: Text, Button, Card,
 * Spinner, Alert, and theme utilities.
 */

import { render } from '@testing-library/react';
import React from 'react';
import { Text } from '../primitives/Text';
import { Button } from '../form/Button';
import { Card } from '../layout/Card';
import { Spinner } from '../feedback/Spinner';
import { Alert } from '../feedback/Alert';
import { ThemeProvider, themeTokens } from '../theme/ThemeProvider';
import { organicBorderRadius, organicShadow } from '../theme/organicStyles';

// Mock @expo/vector-icons used by Icon component
vi.mock('@expo/vector-icons', () => {
  const { createElement } = require('react');
  return {
    Ionicons: ({ name, ...props }: { name: string }) =>
      createElement('Text', { ...props, testID: `icon-${name}` }, name),
  };
});

describe('Text Component', () => {
  it('renders children', () => {
    const { toJSON } = render(<Text>Hello World</Text>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Hello World');
  });

  it('applies display variant class', () => {
    const { toJSON } = render(<Text variant="display">Display</Text>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Display');
  });

  it('applies mono variant class', () => {
    const { toJSON } = render(<Text variant="mono">Code</Text>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Code');
  });

  it('applies size and weight props', () => {
    const { toJSON } = render(
      <Text size="2xl" weight="bold">
        Large Bold
      </Text>
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Large Bold');
  });
});

describe('Button Component', () => {
  it('renders children as label', () => {
    const { toJSON } = render(<Button>Click Me</Button>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Click Me');
  });

  it('renders with primary variant by default', () => {
    const { toJSON } = render(<Button>Primary</Button>);
    expect(toJSON()).toBeTruthy();
  });

  it('renders secondary variant', () => {
    const { toJSON } = render(<Button variant="secondary">Secondary</Button>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Secondary');
  });

  it('renders outline variant', () => {
    const { toJSON } = render(<Button variant="outline">Outline</Button>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Outline');
  });

  it('renders ghost variant', () => {
    const { toJSON } = render(<Button variant="ghost">Ghost</Button>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Ghost');
  });

  it('renders loading state with ActivityIndicator', () => {
    const { toJSON } = render(<Button loading>Loading</Button>);
    const tree = JSON.stringify(toJSON());
    // Loading state should not show the label text
    expect(tree).not.toContain('Loading');
  });

  it('has button accessibility role', () => {
    const { toJSON } = render(<Button>Accessible</Button>);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('button');
  });
});

describe('Card Component', () => {
  it('renders children', () => {
    const { toJSON } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Card Content');
  });

  it('renders elevated variant', () => {
    const { toJSON } = render(
      <Card variant="elevated">
        <Text>Elevated</Text>
      </Card>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders outlined variant', () => {
    const { toJSON } = render(
      <Card variant="outlined">
        <Text>Outlined</Text>
      </Card>
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe('Spinner Component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Spinner />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with label', () => {
    const { toJSON } = render(<Spinner label="Loading data..." />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Loading data...');
  });

  it('has progressbar accessibility role', () => {
    const { toJSON } = render(<Spinner />);
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('progressbar');
  });
});

describe('Alert Component', () => {
  it('renders success alert', () => {
    const { toJSON } = render(
      <Alert type="success" message="Operation completed" />
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Operation completed');
  });

  it('renders error alert', () => {
    const { toJSON } = render(
      <Alert type="error" message="Something went wrong" />
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Something went wrong');
  });

  it('renders warning alert', () => {
    const { toJSON } = render(
      <Alert type="warning" message="Be careful" />
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Be careful');
  });

  it('renders info alert', () => {
    const { toJSON } = render(
      <Alert type="info" message="FYI" />
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('FYI');
  });

  it('renders with title', () => {
    const { toJSON } = render(
      <Alert type="success" title="Success!" message="It worked" />
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('Success!');
    expect(tree).toContain('It worked');
  });

  it('has alert accessibility role', () => {
    const { toJSON } = render(
      <Alert type="info" message="Info message" />
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('alert');
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
      expect(organicShadow.card.shadowColor).toBe('#151820');
      expect(organicShadow.card.elevation).toBeGreaterThan(0);
    });

    it('elevated shadow has greater elevation than card', () => {
      expect(organicShadow.elevated.elevation).toBeGreaterThan(
        organicShadow.card.elevation!
      );
    });
  });
});
