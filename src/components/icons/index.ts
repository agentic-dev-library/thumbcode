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

// Core component, types, and constants
export type { IconColor, IconVariant, PaintDaubeIconProps } from './PaintDaubeIcon';
export { BRAND_COLORS, PaintDaubeIcon } from './PaintDaubeIcon';

// Preset icons - Core
export {
  AgentIcon,
  CelebrateIcon,
  ChatIcon,
  CodeIcon,
  FolderIcon,
  GitHubIcon,
  GitIcon,
  KeyIcon,
  LightningIcon,
  MobileIcon,
  SecurityIcon,
  SettingsIcon,
  StarIcon,
  SuccessIcon,
  ThumbIcon,
} from './icon-presets';

// Preset icons - Navigation & UI
export {
  BellIcon,
  BookIcon,
  BrainIcon,
  BranchIcon,
  EditIcon,
  HomeIcon,
  InfoIcon,
  KeyboardIcon,
  LegalIcon,
  LinkIcon,
  PaletteIcon,
  ReviewIcon,
  SearchIcon,
  SupportIcon,
  TasksIcon,
  UserIcon,
  VibrateIcon,
} from './icon-presets';

// Preset icons - Empty states & feedback
export { ErrorIcon, InboxIcon, TestIcon } from './icon-presets';

// Preset icons - File types
export {
  FileCodeIcon,
  FileConfigIcon,
  FileDataIcon,
  FileDocIcon,
  FileIcon,
  FileMediaIcon,
  FileStyleIcon,
  FileWebIcon,
  FolderOpenIcon,
} from './icon-presets';

// Preset icons - UI controls
export { ChevronDownIcon, CloseIcon, LightbulbIcon, WarningIcon } from './icon-presets';
