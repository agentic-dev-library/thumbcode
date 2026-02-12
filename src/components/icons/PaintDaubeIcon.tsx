/**
 * PaintDaubeIcon - Lucide-based Icon System (Web Migration)
 *
 * During the Expo->Capacitor/web migration, the procedural SVG icon system
 * has been replaced with Lucide icons. This module preserves the public API
 * (BRAND_COLORS, types, PaintDaubeIcon) for backward compatibility.
 *
 * Components that previously used react-native-svg now render Lucide icons
 * with brand colors applied via the color prop.
 */

import * as LucideIcons from 'lucide-react';

// Brand color hex values aligned with CLAUDE.md P3 "Warm Technical" palette
export const BRAND_COLORS = {
  coral: '#FF7059',
  coralDark: '#E85A4F',
  teal: '#0D9488',
  tealDark: '#0F766E',
  gold: '#F5D563',
  goldDark: '#D4A84B',
  charcoal: '#151820',
  warmGray: '#696259',
} as const;

export type IconColor = keyof typeof BRAND_COLORS;

export type IconVariant =
  | 'agent'
  | 'mobile'
  | 'security'
  | 'lightning'
  | 'success'
  | 'celebrate'
  | 'git'
  | 'settings'
  | 'chat'
  | 'code'
  | 'folder'
  | 'folderOpen'
  | 'star'
  | 'key'
  | 'github'
  | 'thumb'
  | 'home'
  | 'tasks'
  | 'search'
  | 'bell'
  | 'link'
  | 'brain'
  | 'palette'
  | 'vibrate'
  | 'keyboard'
  | 'branch'
  | 'book'
  | 'support'
  | 'legal'
  | 'info'
  | 'user'
  | 'edit'
  | 'review'
  | 'inbox'
  | 'error'
  | 'test'
  | 'file'
  | 'fileCode'
  | 'fileData'
  | 'fileDoc'
  | 'fileStyle'
  | 'fileWeb'
  | 'fileMedia'
  | 'fileConfig'
  | 'close'
  | 'lightbulb'
  | 'warning'
  | 'chevronDown';

/**
 * Maps icon variants to the closest Lucide icon component.
 */
const variantToLucide: Record<IconVariant, React.ComponentType<any>> = {
  agent: LucideIcons.Bot,
  mobile: LucideIcons.Smartphone,
  security: LucideIcons.ShieldCheck,
  lightning: LucideIcons.Zap,
  success: LucideIcons.CircleCheck,
  celebrate: LucideIcons.PartyPopper,
  git: LucideIcons.GitCommitHorizontal,
  settings: LucideIcons.Settings,
  chat: LucideIcons.MessageCircle,
  code: LucideIcons.Code2,
  folder: LucideIcons.Folder,
  folderOpen: LucideIcons.FolderOpen,
  star: LucideIcons.Star,
  key: LucideIcons.KeyRound,
  github: LucideIcons.Github,
  thumb: LucideIcons.ThumbsUp,
  home: LucideIcons.Home,
  tasks: LucideIcons.ClipboardList,
  search: LucideIcons.Search,
  bell: LucideIcons.Bell,
  link: LucideIcons.Link,
  brain: LucideIcons.Brain,
  palette: LucideIcons.Palette,
  vibrate: LucideIcons.Vibrate,
  keyboard: LucideIcons.Keyboard,
  branch: LucideIcons.GitBranch,
  book: LucideIcons.BookOpen,
  support: LucideIcons.HelpCircle,
  legal: LucideIcons.Scale,
  info: LucideIcons.Info,
  user: LucideIcons.User,
  edit: LucideIcons.Pencil,
  review: LucideIcons.ScanSearch,
  inbox: LucideIcons.Inbox,
  error: LucideIcons.CircleAlert,
  test: LucideIcons.TestTube2,
  file: LucideIcons.File,
  fileCode: LucideIcons.FileCode2,
  fileData: LucideIcons.FileJson,
  fileDoc: LucideIcons.FileText,
  fileStyle: LucideIcons.FileType,
  fileWeb: LucideIcons.Globe,
  fileMedia: LucideIcons.FileImage,
  fileConfig: LucideIcons.FileCog,
  close: LucideIcons.X,
  lightbulb: LucideIcons.Lightbulb,
  warning: LucideIcons.TriangleAlert,
  chevronDown: LucideIcons.ChevronDown,
};

/** Props for the PaintDaubeIcon component */
export interface PaintDaubeIconProps {
  /** The icon variant to render */
  variant: IconVariant;
  /** Brand color for the icon */
  color?: IconColor;
  /** Icon size in pixels */
  size?: number;
  /** Turbulence intensity (preserved for API compat, not used in web version) */
  turbulence?: number;
  /** Seed for variation (preserved for API compat, not used in web version) */
  seed?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * PaintDaubeIcon - Web-native icon component using Lucide icons.
 *
 * Preserves the same public API as the original react-native-svg implementation
 * but renders Lucide icons with brand colors. The turbulence and seed props are
 * accepted but not applied (they were specific to the SVG filter approach).
 */
export function PaintDaubeIcon({
  variant,
  color = 'coral',
  size = 24,
  className,
}: Readonly<PaintDaubeIconProps>) {
  const LucideIcon = variantToLucide[variant];
  const strokeColor = BRAND_COLORS[color];

  return (
    <span style={{ display: 'inline-flex', width: size, height: size }}>
      <LucideIcon size={size} color={strokeColor} className={className} />
    </span>
  );
}

export default PaintDaubeIcon;
