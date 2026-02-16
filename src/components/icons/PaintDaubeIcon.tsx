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

import type { LucideProps } from 'lucide-react';
import {
  Bell,
  BookOpen,
  Bot,
  Brain,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Code2,
  File,
  FileCode2,
  FileCog,
  FileImage,
  FileJson,
  FileText,
  FileType,
  Folder,
  FolderOpen,
  GitBranch,
  GitCommitHorizontal,
  Github,
  Globe,
  HelpCircle,
  Home,
  Inbox,
  Info,
  Keyboard,
  KeyRound,
  Lightbulb,
  Link,
  MessageCircle,
  Palette,
  PartyPopper,
  Pencil,
  Scale,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Star,
  TestTube2,
  ThumbsUp,
  TriangleAlert,
  User,
  Vibrate,
  X,
  Zap,
} from 'lucide-react';

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
const variantToLucide: Record<IconVariant, React.ComponentType<LucideProps>> = {
  agent: Bot,
  mobile: Smartphone,
  security: ShieldCheck,
  lightning: Zap,
  success: CircleCheck,
  celebrate: PartyPopper,
  git: GitCommitHorizontal,
  settings: Settings,
  chat: MessageCircle,
  code: Code2,
  folder: Folder,
  folderOpen: FolderOpen,
  star: Star,
  key: KeyRound,
  github: Github,
  thumb: ThumbsUp,
  home: Home,
  tasks: ClipboardList,
  search: Search,
  bell: Bell,
  link: Link,
  brain: Brain,
  palette: Palette,
  vibrate: Vibrate,
  keyboard: Keyboard,
  branch: GitBranch,
  book: BookOpen,
  support: HelpCircle,
  legal: Scale,
  info: Info,
  user: User,
  edit: Pencil,
  review: ScanSearch,
  inbox: Inbox,
  error: CircleAlert,
  test: TestTube2,
  file: File,
  fileCode: FileCode2,
  fileData: FileJson,
  fileDoc: FileText,
  fileStyle: FileType,
  fileWeb: Globe,
  fileMedia: FileImage,
  fileConfig: FileCog,
  close: X,
  lightbulb: Lightbulb,
  warning: TriangleAlert,
  chevronDown: ChevronDown,
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
