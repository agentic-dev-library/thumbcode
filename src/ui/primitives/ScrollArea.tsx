/**
 * ScrollArea Component (Web Primitive)
 *
 * A scrollable <div> replacing React Native's ScrollView.
 * Applies overflow-auto for native scrolling behavior.
 */

import type { CSSProperties, ReactNode } from 'react';

export interface ScrollAreaProps {
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test identifier, mapped to data-testid */
  testID?: string;
  /** Child elements */
  children?: ReactNode;
}

/**
 * A scrollable container that wraps content in a div with overflow-auto.
 * Replaces React Native's ScrollView for web.
 */
export function ScrollArea({ className = '', style, testID, children }: Readonly<ScrollAreaProps>) {
  return (
    <div className={`overflow-auto ${className}`} style={style} data-testid={testID}>
      {children}
    </div>
  );
}
