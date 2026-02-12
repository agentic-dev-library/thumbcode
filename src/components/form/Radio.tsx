/**
 * Radio Component
 *
 * A radio button group for single-select options.
 * Web-native replacement using standard radio inputs with custom styling.
 */

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  /** Currently selected value */
  value: string | null;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Available options */
  options: RadioOption[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Label for the group */
  label?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Group name for the radio inputs */
  name?: string;
}

const sizeStyles = {
  sm: { outer: 'w-4 h-4', inner: 'w-2 h-2', labelClass: 'text-sm' },
  md: { outer: 'w-5 h-5', inner: 'w-2.5 h-2.5', labelClass: 'text-base' },
  lg: { outer: 'w-6 h-6', inner: 'w-3 h-3', labelClass: 'text-lg' },
};

export function RadioGroup({
  value,
  onValueChange,
  options,
  direction = 'vertical',
  label,
  error,
  size = 'md',
  name,
}: Readonly<RadioGroupProps>) {
  const styles = sizeStyles[size];
  const groupName = name || `radio-group-${label || 'default'}`;

  return (
    <fieldset className="w-full border-none p-0 m-0" role="radiogroup" aria-label={label}>
      {label && <legend className="font-body text-sm text-neutral-300 mb-2">{label}</legend>}

      <div className={direction === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-3'}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = option.disabled;

          return (
            <label
              key={option.value}
              className={`inline-flex items-start cursor-pointer ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={isSelected}
                onChange={() => onValueChange(option.value)}
                disabled={isDisabled}
                className="sr-only"
              />
              <span
                className={`flex items-center justify-center border-2 rounded-full shrink-0 transition-colors ${styles.outer} ${
                  isSelected ? 'border-teal-500' : 'border-neutral-500'
                }`}
              >
                {isSelected && <span className={`bg-teal-500 rounded-full ${styles.inner}`} />}
              </span>
              <div className="ml-3 flex-1">
                <span className={`block font-body text-white ${styles.labelClass}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="block font-body text-sm text-neutral-400 mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="font-body text-xs text-coral-400 mt-2">{error}</p>}
    </fieldset>
  );
}
