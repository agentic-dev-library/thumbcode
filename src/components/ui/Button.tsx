import { Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { Text } from './Text';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-coral-500 active:bg-coral-700',
    secondary: 'bg-teal-600 active:bg-teal-800',
    outline: 'bg-transparent border-2 border-neutral-200 active:border-teal-400',
  }[variant];
  
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  }[size];
  
  const textColorClass = variant === 'outline' ? 'text-neutral-800' : 'text-white';
  
  return (
    <Pressable
      disabled={disabled || loading}
      className={`
        ${variantClasses}
        ${sizeClasses}
        rounded-[0.5rem_0.75rem_0.625rem_0.875rem]
        shadow-md
        opacity-${disabled ? '50' : '100'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#1E293B' : '#FFFFFF'} />
      ) : (
        <Text className={`${textColorClass} text-center font-semibold`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
