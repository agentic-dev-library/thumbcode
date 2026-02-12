/**
 * Box Component (Web Primitive)
 *
 * A <div> wrapper replacing React Native's View.
 * Supports className, style, testID (mapped to data-testid), children, and onClick.
 */

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export interface BoxProps {
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test identifier, mapped to data-testid */
  testID?: string;
  /** Click handler */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Child elements */
  children?: ReactNode;
}

/**
 * A generic <div> container primitive for layout and grouping.
 *
 * Maps `testID` to `data-testid` for web testing compatibility.
 */
export function Box({ className, style, testID, onClick, children }: Readonly<BoxProps>) {
  return (
    <div
      className={className}
      style={style}
      data-testid={testID}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
