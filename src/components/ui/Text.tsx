import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'display' | 'body' | 'mono';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Text({ 
  variant = 'body', 
  size = 'base',
  weight = 'normal',
  className = '',
  children,
  ...props 
}: TextProps) {
  const variantClass = {
    display: 'font-display',
    body: 'font-body',
    mono: 'font-mono',
  }[variant];
  
  const sizeClass = `text-${size}`;
  
  const weightClass = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight];
  
  return (
    <RNText 
      className={`${variantClass} ${sizeClass} ${weightClass} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
}
