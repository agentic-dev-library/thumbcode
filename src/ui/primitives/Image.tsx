/**
 * Image Component (Web Primitive)
 *
 * A <img> wrapper replacing React Native's Image.
 * Supports src, alt, className, and standard img attributes.
 */

import type { CSSProperties } from 'react';

export interface ImageProps {
  /** Image source URL */
  src: string;
  /** Alternative text for accessibility */
  alt: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Test identifier, mapped to data-testid */
  testID?: string;
  /** Loading strategy */
  loading?: 'eager' | 'lazy';
}

/**
 * A web-native <img> component replacing React Native's Image.
 */
export function Image({
  src,
  alt,
  className,
  style,
  width,
  height,
  testID,
  loading = 'lazy',
}: Readonly<ImageProps>) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      data-testid={testID}
      loading={loading}
    />
  );
}
