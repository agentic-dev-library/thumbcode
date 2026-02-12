/**
 * PaintDaubeIcon - Procedural Organic SVG Icon System
 *
 * ThumbCode's brand identity uses organic "paint daube" shapes instead of
 * traditional geometric icons. This component generates procedural SVG
 * icons with feTurbulence filters for authentic paint texture.
 *
 * Brand Guidelines:
 * - Organic, imperfect shapes (NOT circles/squares)
 * - feTurbulence filters for paint texture
 * - Brand colors only (coral, teal, gold)
 * - Outline style with rounded caps
 * - Asymmetric border paths
 *
 * @see docs/brand/BRAND-GUIDELINES.md
 */

import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { ICON_PATHS } from './icon-paths';
import { PaintDaubeFilter } from './paint-daube-filter';

// Brand color hex values aligned with CLAUDE.md P3 "Warm Technical" palette
export const BRAND_COLORS = {
  coral: '#FF7059', // Primary - Thumb Coral
  coralDark: '#E85A4F', // Light mode variant
  teal: '#0D9488', // Secondary - Digital Teal
  tealDark: '#0F766E', // Light mode variant
  gold: '#F5D563', // Accent - Soft Gold
  goldDark: '#D4A84B', // Light mode variant
  charcoal: '#151820', // Base Dark - Charcoal Navy
  warmGray: '#696259',
} as const;

export type IconColor = keyof typeof BRAND_COLORS;

export type IconVariant =
  | 'agent' // Robot/AI
  | 'mobile' // Phone/device
  | 'security' // Lock/shield
  | 'lightning' // Speed/power
  | 'success' // Checkmark
  | 'celebrate' // Party/celebration
  | 'git' // Version control
  | 'settings' // Gear/cog
  | 'chat' // Message bubble
  | 'code' // Brackets
  | 'folder' // Directory
  | 'folderOpen' // Open directory
  | 'star' // Favorite
  | 'key' // API key
  | 'github' // GitHub logo
  | 'thumb' // ThumbCode logo - thumbs up
  | 'home' // Dashboard/home
  | 'tasks' // Clipboard/tasks
  | 'search' // Magnifying glass
  | 'bell' // Notifications
  | 'link' // Chain link
  | 'brain' // AI/thinking
  | 'palette' // Appearance/theme
  | 'vibrate' // Haptic feedback
  | 'keyboard' // Editor/input
  | 'branch' // Git branch
  | 'book' // Documentation
  | 'support' // Help/support
  | 'legal' // Terms/scales
  | 'info' // Information
  | 'user' // User/profile
  | 'edit' // Pencil/edit
  | 'review' // Review/magnifier
  | 'inbox' // Empty inbox
  | 'error' // Error/warning
  | 'test' // Test/beaker
  | 'file' // Generic file
  | 'fileCode' // Code file (ts/js)
  | 'fileData' // Data file (json)
  | 'fileDoc' // Document (md)
  | 'fileStyle' // Style file (css)
  | 'fileWeb' // Web file (html)
  | 'fileMedia' // Media file (image)
  | 'fileConfig' // Config file (env, lock)
  | 'close' // X mark / close
  | 'lightbulb' // Tip/idea
  | 'warning' // Warning symbol
  | 'chevronDown'; // Dropdown arrow

/** Props for the PaintDaubeIcon component */
export interface PaintDaubeIconProps {
  /** The icon variant to render (e.g. 'agent', 'mobile', 'code') */
  variant: IconVariant;
  /** Brand color for the icon stroke */
  color?: IconColor;
  /** Icon size in pixels (width and height) */
  size?: number;
  /** Intensity of the turbulence effect (0-1) */
  turbulence?: number;
  /** Unique seed for procedural variation */
  seed?: number;
}

/**
 * PaintDaubeIcon - Procedural organic SVG icon component
 *
 * Generates unique, brand-consistent icons with organic paint daube aesthetic.
 * Each icon has slight variations based on the seed value, making them feel
 * hand-crafted rather than machine-perfect.
 */
export function PaintDaubeIcon({
  variant,
  color = 'coral',
  size = 24,
  turbulence = 0.3,
  seed = 42,
}: Readonly<PaintDaubeIconProps>) {
  const filterId = `paint-daube-${variant}-${seed}`;
  const strokeColor = BRAND_COLORS[color];
  const pathData = ICON_PATHS[variant](seed);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <PaintDaubeFilter id={filterId} turbulence={turbulence} />
        <G filter={`url(#${filterId})`}>
          <Path
            d={pathData}
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      </Svg>
    </View>
  );
}

export default PaintDaubeIcon;
