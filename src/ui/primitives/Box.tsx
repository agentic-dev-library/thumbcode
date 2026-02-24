/**
 * Box Component (Web Primitive)
 *
 * A <div> wrapper replacing React Native's View.
 * Supports className, style, testID (mapped to data-testid), children, and onClick.
 */

import type { CSSProperties, KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react';

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
 * When onClick is provided, adds keyboard accessibility (role="button", Enter/Space support).
 */
export function Box({ className, style, testID, onClick, children }: Readonly<BoxProps>) {
  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> | undefined = onClick
    ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }
    : undefined;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role is set dynamically when onClick is provided
    <div
      className={className}
      style={style}
      data-testid={testID}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
