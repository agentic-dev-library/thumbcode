/**
 * ThumbCode Icon System
 *
 * Procedural paint daube SVG icons that embody the "Warm Technical" brand.
 * All icons use organic shapes, feTurbulence filters, and brand colors.
 *
 * Usage:
 * ```tsx
 * import { AgentIcon, MobileIcon, SecurityIcon } from '@/components/icons';
 *
 * <AgentIcon size={32} color="coral" />
 * <MobileIcon size={24} turbulence={0.4} />
 * <SecurityIcon seed={123} /> // Different seed = unique variation
 * ```
 *
 * @see PaintDaubeIcon for full documentation
 */

// Preset icons - Core
// Preset icons - Navigation & UI
// Preset icons - Empty states & feedback
// Preset icons - File types
// Preset icons - UI controls
export {
  AgentIcon,
  BellIcon,
  BookIcon,
  BrainIcon,
  BranchIcon,
  CelebrateIcon,
  ChatIcon,
  ChevronDownIcon,
  CloseIcon,
  CodeIcon,
  EditIcon,
  ErrorIcon,
  FileCodeIcon,
  FileConfigIcon,
  FileDataIcon,
  FileDocIcon,
  FileIcon,
  FileMediaIcon,
  FileStyleIcon,
  FileWebIcon,
  FolderIcon,
  FolderOpenIcon,
  GitHubIcon,
  GitIcon,
  HomeIcon,
  InboxIcon,
  InfoIcon,
  KeyboardIcon,
  KeyIcon,
  LegalIcon,
  LightbulbIcon,
  LightningIcon,
  LinkIcon,
  MobileIcon,
  PaletteIcon,
  ReviewIcon,
  SearchIcon,
  SecurityIcon,
  SettingsIcon,
  StarIcon,
  SuccessIcon,
  SupportIcon,
  TasksIcon,
  TestIcon,
  ThumbIcon,
  UserIcon,
  VibrateIcon,
  WarningIcon,
} from './icon-presets';
// Core component, types, and constants
export type { IconColor, IconVariant, PaintDaubeIconProps } from './PaintDaubeIcon';
export { BRAND_COLORS, PaintDaubeIcon } from './PaintDaubeIcon';
