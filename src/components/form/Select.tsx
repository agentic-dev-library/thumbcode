/**
 * Select Component
 *
 * A web-native <select>/<option> dropdown with organic styling.
 * Replaces the React Native Modal-based select.
 */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  /** Currently selected value */
  value: string | null;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Available options */
  options: SelectOption[];
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Test identifier */
  testID?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
  testID,
}: Readonly<SelectProps>) {
  const hasError = Boolean(error);

  const borderClass = hasError ? 'border-coral-500' : 'border-neutral-600';

  return (
    <div className="w-full">
      {label && (
        <label className="block font-body text-sm text-neutral-300 mb-1.5">{label}</label>
      )}

      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none bg-neutral-800 text-white font-body px-4 py-3 pr-10 border rounded-organic-input transition-colors disabled:opacity-50 focus:border-teal-500 focus:outline-none ${borderClass} ${!value ? 'text-neutral-500' : ''} ${className}`}
          data-testid={testID}
          aria-label={label || placeholder}
          aria-invalid={hasError || undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="font-body text-xs text-coral-400 mt-1">{error}</p>
      )}
    </div>
  );
}
