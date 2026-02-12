import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';
import { Text } from './Text';

/** Props for the Input component */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label text displayed above the input */
  label?: string;
  /** Optional error message displayed below the input */
  error?: string;
  /** onChangeText compatibility (maps to onChange) */
  onChangeText?: (value: string) => void;
}

/** Placeholder color from design tokens - neutral-400 */
const PLACEHOLDER_COLOR = getColor('neutral', '400');

/**
 * Renders a text input with an optional label and error message.
 */
export function Input({
  label,
  error,
  className = '',
  style,
  onChangeText,
  onChange,
  ...props
}: Readonly<InputProps>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeText?.(e.target.value);
    onChange?.(e);
  };

  return (
    <div className="w-full">
      {label && <Text className="mb-2 text-neutral-700 font-medium">{label}</Text>}
      <input
        className={`
          bg-white
          border-2
          ${error ? 'border-coral-500' : 'border-neutral-200'}
          px-4 py-3
          font-body text-base text-neutral-900
          w-full
          ${className}
        `}
        style={{ ...organicBorderRadius.textInput, ...style }}
        onChange={handleChange}
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-coral-500">{error}</Text>}
    </div>
  );
}
