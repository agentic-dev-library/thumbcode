/**
 * Tooltip Component
 *
 * Contextual information popup on long-press (mobile) or hover.
 * Uses organic styling with directional arrows.
 */

import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { Text } from '@/components/ui';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Content to show in tooltip */
  content: string;
  /** Element that triggers the tooltip */
  children: ReactNode;
  /** Position relative to children */
  position?: TooltipPosition;
  /** Delay before showing (ms) */
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
}: Readonly<TooltipProps>) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  }, []);

  const getTooltipStyle = (): React.CSSProperties => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return {};

    const offset = 8;
    switch (position) {
      case 'top':
        return {
          bottom: rect.height + offset,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: rect.height + offset,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          right: rect.width + offset,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          left: rect.width + offset,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onMouseDown={showTooltip}
        onMouseUp={hideTooltip}
        onMouseLeave={hideTooltip}
        aria-description="Long press for more info"
      >
        {children}
      </button>

      {visible && (
        <div
          className="absolute z-50 bg-neutral-800 px-3 py-2 rounded-organic-badge"
          style={{
            ...getTooltipStyle(),
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <Text className="font-body text-sm text-white whitespace-nowrap">{content}</Text>
        </div>
      )}
    </div>
  );
}

interface InfoTipProps {
  /** Info content */
  content: string;
  /** Size of the info icon */
  size?: 'sm' | 'md';
}

export function InfoTip({ content, size = 'sm' }: Readonly<InfoTipProps>) {
  const dimension = size === 'sm' ? 16 : 20;
  const fontSize = size === 'sm' ? 10 : 12;

  return (
    <Tooltip content={content}>
      <span
        className="inline-flex items-center justify-center bg-neutral-700 rounded-full"
        style={{ width: dimension, height: dimension }}
      >
        <Text className="font-body text-neutral-300" style={{ fontSize, lineHeight: fontSize + 2 }}>
          ?
        </Text>
      </span>
    </Tooltip>
  );
}
