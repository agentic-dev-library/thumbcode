import { Text } from '../primitives/Text';
import { organicBorderRadius } from '../theme/organicStyles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onChangeText?: (value: string) => void;
}

/**
 * Renders a text input with an optional label and error message.
 * Uses ThumbCode's organic P3 "Warm Technical" styling with asymmetric border-radius.
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
        style={{ ...organicBorderRadius.input, ...style }}
        onChange={handleChange}
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-coral-500">{error}</Text>}
    </div>
  );
}
