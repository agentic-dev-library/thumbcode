/**
 * Progress Components
 *
 * Progress bars and indicators for tracking completion status.
 * Uses paint daube icons for brand consistency.
 */

import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Text } from '@/components/ui';
import { SuccessIcon } from '@/components/icons';

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
  sm: 4,
  md: 8,
  lg: 12,
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
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const widthAnim = useRef(new Animated.Value(clampedValue)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: clampedValue,
        useNativeDriver: false,
        tension: 50,
        friction: 10,
      }).start();
    } else {
      widthAnim.setValue(clampedValue);
    }
  }, [clampedValue, animated, widthAnim]);

  const height = barSizes[size];

  return (
    <View className="w-full">
      {showLabel && (
        <View className="flex-row justify-between mb-1">
          <Text className="font-body text-sm text-neutral-300">{label || 'Progress'}</Text>
          <Text className="font-body text-sm text-neutral-400">{Math.round(clampedValue)}%</Text>
        </View>
      )}
      <View
        className="bg-neutral-700 overflow-hidden w-full"
        style={{
          height,
          borderRadius: height / 2,
        }}
      >
        <Animated.View
          className={barColors[color]}
          style={{
            height,
            borderRadius: height / 2,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
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
}: ProgressCircleProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: clampedValue,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [clampedValue, rotateAnim]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Note: strokeDashoffset would be used with SVG, kept for future SVG-based implementation
  const _strokeDashoffset = circumference - (circumference * clampedValue) / 100;
  void _strokeDashoffset;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View className="absolute items-center justify-center" style={{ width: size, height: size }}>
        {/* Background circle */}
        <View
          className="absolute border-neutral-700"
          style={{
            width: size - strokeWidth,
            height: size - strokeWidth,
            borderRadius: (size - strokeWidth) / 2,
            borderWidth: strokeWidth,
          }}
        />
        {/* Progress indicator using rotation technique */}
        <View
          className="absolute overflow-hidden"
          style={{
            width: size,
            height: size,
            transform: [{ rotate: '-90deg' }],
          }}
        >
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: circleColors[color],
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: `${(clampedValue / 100) * 360}deg` }],
            }}
          />
        </View>
      </View>
      {showLabel && (
        <Text className="font-body text-sm text-white font-semibold">
          {Math.round(clampedValue)}%
        </Text>
      )}
    </View>
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

export function StepsProgress({ totalSteps, currentStep, labels }: StepsProgressProps) {
  return (
    <View className="w-full">
      <View className="flex-row items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <View key={stepNum} className="flex-row items-center flex-1 last:flex-none">
              <View
                className={`w-8 h-8 items-center justify-center ${
                  isCompleted ? 'bg-teal-600' : isCurrent ? 'bg-coral-500' : 'bg-neutral-700'
                }`}
                style={{
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 10,
                  borderBottomRightRadius: 8,
                  borderBottomLeftRadius: 12,
                }}
              >
                {isCompleted ? (
                  <SuccessIcon size={14} color="warmGray" turbulence={0.15} />
                ) : (
                  <Text className="font-body text-sm text-white font-semibold">{stepNum}</Text>
                )}
              </View>
              {stepNum < totalSteps && (
                <View
                  className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-teal-600' : 'bg-neutral-700'}`}
                />
              )}
            </View>
          );
        })}
      </View>
      {labels && (
        <View className="flex-row mt-2">
          {labels.map((label, i) => (
            <Text
              key={label}
              className={`flex-1 text-xs font-body ${
                i + 1 <= currentStep ? 'text-white' : 'text-neutral-500'
              } ${i === 0 ? '' : 'text-center'} ${i === labels.length - 1 ? 'text-right' : ''}`}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
