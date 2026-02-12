# @thumbcode/ui

Shared UI components for ThumbCode with the organic P3 "Warm Technical" design system. All components use asymmetric border-radius and warm color tints following the ThumbCode brand identity.

## Installation

This package is part of the ThumbCode monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@thumbcode/ui": "workspace:*"
  }
}
```

## Components

### Primitives (`@thumbcode/ui/primitives`)

- `Text` -- Themed text component with font family and color support

### Form (`@thumbcode/ui/form`)

- `Button` -- Organic-styled button with coral/teal/gold variants
- `Input` -- Text input with organic border styling

### Layout (`@thumbcode/ui/layout`)

- `Card` -- Container with organic border-radius and shadow
- `Container` -- Page-level layout wrapper
- `Header` -- Navigation header with back button support

### Feedback (`@thumbcode/ui/feedback`)

- `Alert` -- Status alert with success/error/warning/info variants
- `Spinner` -- Loading indicator

### Theme (`@thumbcode/ui/theme`)

- `ThemeProvider` -- React context provider for theming
- `useTheme()` -- Access current theme mode and toggle
- `useColor()` -- Access resolved color values
- `useSpacing()` -- Access spacing scale
- `organicBorderRadius` -- Preset asymmetric border-radius styles for card, button, and badge shapes
- `organicShadow` -- Preset organic shadow styles with brand color tints

### Icons

- `Icon` -- Semantic icon component backed by Ionicons
- `iconMap` -- Maps semantic names (`back`, `alertSuccess`, `alertError`, `alertWarning`, `alertInfo`) to Ionicons

## Usage

```typescript
import { Button, Card, Text, ThemeProvider } from '@thumbcode/ui';

function App() {
  return (
    <ThemeProvider>
      <Card>
        <Text>Hello from ThumbCode</Text>
        <Button onPress={() => {}}>Get Started</Button>
      </Card>
    </ThemeProvider>
  );
}
```

### Organic Styles

Apply the signature ThumbCode organic look to custom components:

```typescript
import { organicBorderRadius, organicShadow } from '@thumbcode/ui';

<View style={[organicBorderRadius.card, organicShadow.card]}>
  {/* Content with organic styling */}
</View>
```

## Dependencies

- `@expo/vector-icons` -- Icon library (Ionicons)
- `nativewind` -- Tailwind CSS for React Native
- `react-native` -- React Native core

## Related

- [ThumbCode README](../../README.md)
- [Brand Identity (CLAUDE.md)](../../CLAUDE.md)
