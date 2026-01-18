# @thumbcode/dev-tools

Development tooling for ThumbCode - design token generation and asset processing.

## What's Inside

This package contains build-time tools for generating design system artifacts and processing assets:

### Design Token Generator (`generate-tokens.ts`)

Converts `design-system/tokens.json` into consumable formats:
- **CSS Custom Properties** → `design-system/generated/variables.css`
- **Tailwind Colors** → `design-system/generated/tailwind-colors.js`

```bash
pnpm run generate:tokens
```

### Icon Generator (`generate-icons.ts`)

Converts procedurally-generated SVG icons to PNG with transparent backgrounds at exact sizes required by Expo:

- `icon.png` - 1024x1024px (main app icon)
- `splash.png` - 2048x2048px (splash screen)
- `adaptive-icon.png` - 1024x1024px (Android adaptive icon)
- `favicon.png` - 48x48px (web favicon)

```bash
pnpm run generate:icons
```

### Generate All

Run both generators in sequence:

```bash
pnpm run generate:all
```

## Architecture

This package is part of a pnpm workspace monorepo. It's kept separate from the main app to:

1. **Isolate build-time dependencies** (sharp, etc.) from runtime dependencies
2. **Enable reuse** across multiple packages if needed
3. **Improve build performance** by not bundling dev tools in the app
4. **Maintain clear separation** between procedural generation and application code

## Dependencies

- **sharp** - High-performance image processing (SVG → PNG conversion)
- **tsx** - TypeScript execution for Node.js scripts

## Usage from Root

The root `package.json` delegates to this package:

```json
{
  "scripts": {
    "generate:tokens": "pnpm --filter @thumbcode/dev-tools run generate:tokens",
    "generate:icons": "pnpm --filter @thumbcode/dev-tools run generate:icons",
    "generate:all": "pnpm --filter @thumbcode/dev-tools run generate:all"
  }
}
```

## Development

When adding new generators:

1. Create new `.ts` file in `src/`
2. Add executable shebang: `#!/usr/bin/env tsx`
3. Export main function for programmatic use
4. Add script to `package.json`
5. Update root scripts if needed for convenience

## Why TypeScript?

All generators are written in TypeScript for:
- **Type safety** when parsing tokens.json
- **Better IDE support** for contributors
- **Consistency** with main app codebase
- **Future extensibility** (could export types, shared utilities, etc.)
