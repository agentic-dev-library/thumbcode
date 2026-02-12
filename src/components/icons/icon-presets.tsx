/**
 * Preset Icon Components
 *
 * Pre-configured icon components for common use cases,
 * each wrapping PaintDaubeIcon with a specific variant and optional default color.
 */

import { PaintDaubeIcon, type PaintDaubeIconProps } from './PaintDaubeIcon';

type PresetProps = Omit<PaintDaubeIconProps, 'variant'>;

// Core icons
export const AgentIcon = (props: PresetProps) => <PaintDaubeIcon variant="agent" {...props} />;
export const MobileIcon = (props: PresetProps) => <PaintDaubeIcon variant="mobile" {...props} />;
export const SecurityIcon = (props: PresetProps) => <PaintDaubeIcon variant="security" {...props} />;
export const LightningIcon = (props: PresetProps) => <PaintDaubeIcon variant="lightning" {...props} />;
export const SuccessIcon = (props: PresetProps) => <PaintDaubeIcon variant="success" color="teal" {...props} />;
export const CelebrateIcon = (props: PresetProps) => <PaintDaubeIcon variant="celebrate" color="gold" {...props} />;
export const GitIcon = (props: PresetProps) => <PaintDaubeIcon variant="git" {...props} />;
export const SettingsIcon = (props: PresetProps) => <PaintDaubeIcon variant="settings" {...props} />;
export const ChatIcon = (props: PresetProps) => <PaintDaubeIcon variant="chat" {...props} />;
export const CodeIcon = (props: PresetProps) => <PaintDaubeIcon variant="code" {...props} />;
export const FolderIcon = (props: PresetProps) => <PaintDaubeIcon variant="folder" {...props} />;
export const StarIcon = (props: PresetProps) => <PaintDaubeIcon variant="star" color="gold" {...props} />;
export const KeyIcon = (props: PresetProps) => <PaintDaubeIcon variant="key" {...props} />;
export const GitHubIcon = (props: PresetProps) => <PaintDaubeIcon variant="github" color="charcoal" {...props} />;
export const ThumbIcon = (props: PresetProps) => <PaintDaubeIcon variant="thumb" {...props} />;

// Navigation & UI icons
export const HomeIcon = (props: PresetProps) => <PaintDaubeIcon variant="home" {...props} />;
export const TasksIcon = (props: PresetProps) => <PaintDaubeIcon variant="tasks" {...props} />;
export const SearchIcon = (props: PresetProps) => <PaintDaubeIcon variant="search" {...props} />;
export const BellIcon = (props: PresetProps) => <PaintDaubeIcon variant="bell" {...props} />;
export const LinkIcon = (props: PresetProps) => <PaintDaubeIcon variant="link" {...props} />;
export const BrainIcon = (props: PresetProps) => <PaintDaubeIcon variant="brain" {...props} />;
export const PaletteIcon = (props: PresetProps) => <PaintDaubeIcon variant="palette" {...props} />;
export const VibrateIcon = (props: PresetProps) => <PaintDaubeIcon variant="vibrate" {...props} />;
export const KeyboardIcon = (props: PresetProps) => <PaintDaubeIcon variant="keyboard" {...props} />;
export const BranchIcon = (props: PresetProps) => <PaintDaubeIcon variant="branch" {...props} />;
export const BookIcon = (props: PresetProps) => <PaintDaubeIcon variant="book" {...props} />;
export const SupportIcon = (props: PresetProps) => <PaintDaubeIcon variant="support" {...props} />;
export const LegalIcon = (props: PresetProps) => <PaintDaubeIcon variant="legal" {...props} />;
export const InfoIcon = (props: PresetProps) => <PaintDaubeIcon variant="info" {...props} />;
export const UserIcon = (props: PresetProps) => <PaintDaubeIcon variant="user" {...props} />;
export const EditIcon = (props: PresetProps) => <PaintDaubeIcon variant="edit" {...props} />;
export const ReviewIcon = (props: PresetProps) => <PaintDaubeIcon variant="review" {...props} />;

// Empty states & feedback icons
export const InboxIcon = (props: PresetProps) => <PaintDaubeIcon variant="inbox" {...props} />;
export const ErrorIcon = (props: PresetProps) => <PaintDaubeIcon variant="error" color="coral" {...props} />;
export const TestIcon = (props: PresetProps) => <PaintDaubeIcon variant="test" {...props} />;

// File type icons
export const FolderOpenIcon = (props: PresetProps) => <PaintDaubeIcon variant="folderOpen" {...props} />;
export const FileIcon = (props: PresetProps) => <PaintDaubeIcon variant="file" {...props} />;
export const FileCodeIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileCode" color="teal" {...props} />;
export const FileDataIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileData" color="gold" {...props} />;
export const FileDocIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileDoc" {...props} />;
export const FileStyleIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileStyle" color="coral" {...props} />;
export const FileWebIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileWeb" color="teal" {...props} />;
export const FileMediaIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileMedia" color="coral" {...props} />;
export const FileConfigIcon = (props: PresetProps) => <PaintDaubeIcon variant="fileConfig" color="warmGray" {...props} />;

// UI controls
export const CloseIcon = (props: PresetProps) => <PaintDaubeIcon variant="close" {...props} />;
export const LightbulbIcon = (props: PresetProps) => <PaintDaubeIcon variant="lightbulb" color="gold" {...props} />;
export const WarningIcon = (props: PresetProps) => <PaintDaubeIcon variant="warning" color="gold" {...props} />;
export const ChevronDownIcon = (props: PresetProps) => <PaintDaubeIcon variant="chevronDown" {...props} />;
