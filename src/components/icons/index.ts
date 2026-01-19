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

export {
  PaintDaubeIcon,
  BRAND_COLORS,
  // Preset icons - Core
  AgentIcon,
  MobileIcon,
  SecurityIcon,
  LightningIcon,
  SuccessIcon,
  CelebrateIcon,
  GitIcon,
  SettingsIcon,
  ChatIcon,
  CodeIcon,
  FolderIcon,
  StarIcon,
  KeyIcon,
  GitHubIcon,
  ThumbIcon,
  // Preset icons - Navigation & UI
  HomeIcon,
  TasksIcon,
  SearchIcon,
  BellIcon,
  LinkIcon,
  BrainIcon,
  PaletteIcon,
  VibrateIcon,
  KeyboardIcon,
  BranchIcon,
  BookIcon,
  SupportIcon,
  LegalIcon,
  InfoIcon,
  UserIcon,
  EditIcon,
  ReviewIcon,
  // Preset icons - Empty states & feedback
  InboxIcon,
  ErrorIcon,
  TestIcon,
  CloseIcon,
  WarningIcon,
  LightbulbIcon,
  // Preset icons - UI controls
  ChevronDownIcon,
  // Preset icons - File types
  FolderOpenIcon,
  FileIcon,
  FileCodeIcon,
  FileDataIcon,
  FileDocIcon,
  FileStyleIcon,
  FileWebIcon,
  FileMediaIcon,
  FileConfigIcon,
} from './PaintDaubeIcon';

export type { IconColor, IconVariant } from './PaintDaubeIcon';
