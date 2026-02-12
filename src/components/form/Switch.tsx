/**
 * Switch Component
 *
 * A toggle switch for boolean settings with organic styling.
 * Web-native replacement using a hidden checkbox input.
 */

interface SwitchProps {
  /** Whether the switch is on */
  value: boolean;
  /** Callback when value changes */
  onValueChange: (value: boolean) => void;
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  lg: { track: 'w-[52px] h-7', thumb: 'w-6 h-6', translate: 'translate-x-6' },
};

export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: Readonly<SwitchProps>) {
  const styles = sizeStyles[size];

  return (
    <label
      className={`flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {(label || description) && (
        <div className="flex-1 mr-3">
          {label && <span className="block font-body text-white text-base">{label}</span>}
          {description && (
            <span className="block font-body text-sm text-neutral-400 mt-0.5">{description}</span>
          )}
        </div>
      )}
      <input
        type="checkbox"
        checked={value}
        onChange={() => onValueChange(!value)}
        disabled={disabled}
        className="sr-only"
        role="switch"
        aria-checked={value}
      />
      <span
        className={`relative inline-flex items-center rounded-full transition-colors duration-200 ${styles.track} ${
          value ? 'bg-teal-600' : 'bg-neutral-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-200 ${styles.thumb} ${
            value ? styles.translate : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  );
}
