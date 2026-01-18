import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
}

export function Card({ 
  variant = 'default',
  className = '',
  children,
  ...props 
}: CardProps) {
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-neutral-50 shadow-lg',
  }[variant];
  
  return (
    <View 
      className={`
        ${variantClasses}
        p-4
        rounded-[1rem_0.75rem_1.25rem_0.5rem]
        border border-neutral-200
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
}
