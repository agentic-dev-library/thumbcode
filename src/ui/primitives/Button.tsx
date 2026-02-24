/**
 * Button Component (Web Primitive)
 *
 * A <button> wrapper replacing React Native's Pressable for button use cases.
 * Maps onPress to onClick, accessibilityRole/Label to aria-* attributes.
 */

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export interface ButtonProps {
  /** Click handler (replaces onPress) */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** @deprecated Use onClick instead. Alias for onPress compatibility. */
  onPress?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Accessibility role (mapped to role attribute) */
  accessibilityRole?: string;
  /** Accessibility label (mapped to aria-label) */
  accessibilityLabel?: string;
  /** Accessibility hint (mapped to title) */
  accessibilityHint?: string;
  /** Accessibility state (mapped to aria-* attributes) */
  accessibilityState?: {
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
  };
  /** Test identifier, mapped to data-testid */
  testID?: string;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Child elements */
  children?: ReactNode;
}

/**
 * A web-native <button> component replacing React Native Pressable for interactive elements.
 *
 * Supports both onClick and onPress (legacy alias) for backward compatibility.
 * Maps React Native accessibility props to standard HTML/ARIA attributes.
 */
export function Button({
  onClick,
  onPress,
  className,
  style,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  testID,
  type = 'button',
  children,
}: Readonly<ButtonProps>) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onPress) {
      onPress();
    }
  };

  const supportsChecked =
    accessibilityRole === 'checkbox' ||
    accessibilityRole === 'switch' ||
    accessibilityRole === 'radio';

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-checked is conditionally applied only for checkbox/switch/radio roles
    <button
      type={type}
      className={className}
      style={style}
      disabled={disabled || accessibilityState?.disabled}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      title={accessibilityHint}
      aria-checked={supportsChecked ? accessibilityState?.checked : undefined}
      aria-expanded={accessibilityState?.expanded}
      aria-selected={accessibilityState?.selected}
      aria-disabled={accessibilityState?.disabled}
      data-testid={testID}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
