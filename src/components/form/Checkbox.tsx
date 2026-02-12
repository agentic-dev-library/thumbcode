/**
 * Checkbox Component
 *
 * A checkbox input with label support and organic styling.
 * Web-native replacement using a hidden checkbox input with custom visuals.
 */

interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when checked state changes */
  onCheckedChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { box: 'w-4 h-4', icon: 'w-2.5 h-2.5', labelClass: 'text-sm' },
  md: { box: 'w-5 h-5', icon: 'w-3 h-3', labelClass: 'text-base' },
  lg: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', labelClass: 'text-lg' },
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: Readonly<CheckboxProps>) {
  const styles = sizeStyles[size];

  return (
    <label
      className={`inline-flex items-start cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onCheckedChange(!checked)}
        disabled={disabled}
        className="sr-only"
        aria-checked={checked}
      />
      <span
        className={`flex items-center justify-center border-2 rounded-organic-badge shrink-0 transition-colors ${styles.box} ${
          checked ? 'bg-teal-600 border-teal-600' : 'bg-transparent border-neutral-500'
        }`}
      >
        {checked && (
          <svg
            className={`text-white ${styles.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <span className={`block font-body text-white ${styles.labelClass}`}>{label}</span>
          )}
          {description && (
            <span className="block font-body text-sm text-neutral-400 mt-0.5">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
