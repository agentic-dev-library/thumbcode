/**
 * Progress Components
 *
 * Progress bars and indicators for tracking completion status.
 * Web-native implementation using CSS transitions and SVG.
 */

import { CircleCheck } from 'lucide-react';

interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  value: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  label?: string;
  /** Animate changes */
  animated?: boolean;
}

const barSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const barColors = {
  primary: 'bg-coral-500',
  secondary: 'bg-teal-500',
  success: 'bg-teal-600',
  warning: 'bg-gold-500',
};

export function ProgressBar({
  value,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  animated = true,
}: Readonly<ProgressBarProps>) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="font-body text-sm text-neutral-300">{label || 'Progress'}</span>
          <span className="font-body text-sm text-neutral-400">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
        className={`bg-neutral-700 overflow-hidden w-full ${barSizes[size]}`}
        style={{ borderRadius: '8px 10px 8px 12px' }}
      >
        <div
          className={`${barColors[color]} h-full ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{
            width: `${clampedValue}%`,
            borderRadius: '8px 10px 8px 12px',
          }}
        />
      </div>
    </div>
  );
}

interface ProgressCircleProps {
  /** Progress value between 0 and 100 */
  value: number;
  /** Size of the circle */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  /** Show percentage in center */
  showLabel?: boolean;
}

const circleColors = {
  primary: '#FF7059',
  secondary: '#14B8A6',
  success: '#0D9488',
  warning: '#F5D563',
};

export function ProgressCircle({
  value,
  size = 64,
  strokeWidth = 4,
  color = 'primary',
  showLabel = true,
}: Readonly<ProgressCircleProps>) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-700"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circleColors[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute font-body text-sm text-white font-semibold">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}

interface StepsProgressProps {
  /** Total number of steps */
  totalSteps: number;
  /** Current step (1-indexed) */
  currentStep: number;
  /** Step labels */
  labels?: string[];
}

export function StepsProgress({ totalSteps, currentStep, labels }: Readonly<StepsProgressProps>) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          let stepBg = 'bg-neutral-700';
          if (isCompleted) stepBg = 'bg-teal-600';
          else if (isCurrent) stepBg = 'bg-coral-500';

          return (
            <div
              key={stepNum}
              className={`flex items-center ${stepNum < totalSteps ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center ${stepBg} rounded-organic-button`}
              >
                {isCompleted ? (
                  <CircleCheck size={14} className="text-white" />
                ) : (
                  <span className="font-body text-sm text-white font-semibold">{stepNum}</span>
                )}
              </div>
              {stepNum < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-teal-600' : 'bg-neutral-700'}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {labels && (
        <div className="flex mt-2">
          {labels.map((stepLabel, i) => {
            const colorClass = i + 1 <= currentStep ? 'text-white' : 'text-neutral-500';
            let alignClass = 'text-center';
            if (i === 0) alignClass = 'text-left';
            if (i === labels.length - 1) alignClass = 'text-right';

            return (
              <span
                key={stepLabel}
                className={`flex-1 text-xs font-body ${colorClass} ${alignClass}`}
              >
                {stepLabel}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
