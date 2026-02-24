import { CloseIcon, SuccessIcon } from '@/components/icons';

/** Spinner component for loading states */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

interface APIKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isValidating: boolean;
  isValid: boolean | null;
  error?: string;
  helperText: string;
  testId: string;
}

export function APIKeyInput({
  label,
  placeholder,
  value,
  onChange,
  isValidating,
  isValid,
  error,
  helperText,
  testId,
}: APIKeyInputProps) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex flex-row items-center">
        <span className="font-body font-semibold text-white flex-1">{label}</span>
        {isValidating && <Spinner />}
        {isValid === true && <SuccessIcon size={18} color="teal" turbulence={0.15} />}
        {isValid === false && <CloseIcon size={18} color="coral" turbulence={0.15} />}
      </div>

      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border-2 ${
          error ? 'border-coral-500' : 'border-neutral-200'
        } px-4 py-3 font-body text-base text-neutral-900 rounded-organic-input placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/40`}
        data-testid={testId}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
      />

      {error && <span className="font-body text-sm text-coral-500">{error}</span>}

      <span className="font-body text-xs text-neutral-500">{helperText}</span>
    </div>
  );
}
