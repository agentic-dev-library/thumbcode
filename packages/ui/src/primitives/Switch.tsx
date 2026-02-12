/**
 * Switch Component (Web Primitive)
 *
 * A toggle switch built on a hidden checkbox input.
 * Provides visual feedback for on/off states with organic styling.
 */

import type { CSSProperties } from 'react';

export interface SwitchProps {
  /** Whether the switch is on */
  value: boolean;
  /** Callback when value changes */
  onValueChange: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Additional CSS class names for the outer container */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test identifier, mapped to data-testid */
  testID?: string;
}

/**
 * A web-native toggle switch component using a hidden checkbox.
 *
 * Renders a visually styled toggle that uses an underlying checkbox input
 * for proper accessibility and form semantics.
 */
export function Switch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  className = '',
  style,
  testID,
}: Readonly<SwitchProps>) {
  return (
    <label
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      style={style}
      data-testid={testID}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={() => onValueChange(!value)}
        disabled={disabled}
        className="sr-only"
        role="switch"
        aria-checked={value}
        aria-label={accessibilityLabel}
      />
      <span
        className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-200 ${
          value ? 'bg-teal-600' : 'bg-neutral-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  );
}
