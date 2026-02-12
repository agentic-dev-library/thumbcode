/**
 * CredentialSection
 *
 * Reusable components for displaying connected services and API key inputs
 * in the credentials settings screen.
 */

import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/display';
import type { IconColor } from '@/components/icons';
import { HStack, VStack } from '@/components/layout';
import { Text } from '@/components/ui';
import { organicBorderRadius } from '@/lib/organic-styles';
import { getColor } from '@/utils/design-tokens';

type CredentialIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

export interface CredentialItemProps {
  Icon: CredentialIconComponent;
  iconColor?: IconColor;
  title: string;
  subtitle: string;
  isConnected: boolean;
  lastUsed?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function CredentialItem({
  Icon,
  iconColor = 'teal',
  title,
  subtitle,
  isConnected,
  lastUsed,
  onConnect,
  onDisconnect,
}: Readonly<CredentialItemProps>) {
  return (
    <div className="py-4">
      <HStack align="start">
        <div
          className="w-12 h-12 bg-surface-elevated items-center justify-center mr-4"
          style={organicBorderRadius.badge}
        >
          <Icon size={24} color={iconColor} turbulence={0.2} />
        </div>

        <VStack spacing="xs" className="flex-1">
          <HStack align="center">
            <Text className="text-white font-semibold">{title}</Text>
            {isConnected && (
              <div className="ml-2">
                <Badge variant="success" size="sm">
                  Connected
                </Badge>
              </div>
            )}
          </HStack>
          <Text size="sm" className="text-neutral-500">
            {subtitle}
          </Text>
          {isConnected && lastUsed && (
            <Text size="xs" className="text-neutral-600">
              Last used: {lastUsed}
            </Text>
          )}
        </VStack>

        <button type="button"
          onClick={isConnected ? onDisconnect : onConnect}
          className={`px-4 py-2 ${isConnected ? 'bg-coral-500/20' : 'bg-teal-500/20'}`}
          style={organicBorderRadius.button}
        >
          <Text className={isConnected ? 'text-coral-500' : 'text-teal-500'}>
            {isConnected ? 'Remove' : 'Connect'}
          </Text>
        </button>
      </HStack>
    </div>
  );
}

export interface ApiKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSet: boolean;
  isSaving?: boolean;
  error?: string;
}

export function ApiKeyInput({
  label,
  placeholder,
  value,
  onChange,
  onSave,
  isSet,
  isSaving,
  error,
}: Readonly<ApiKeyInputProps>) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (value.trim()) {
      onSave();
    }
  };

  const canSave = value.trim().length > 0 && !isSaving;

  return (
    <div className="py-4">
      <HStack justify="between" align="center" className="mb-2">
        <Text className="text-white">{label}</Text>
        {isSet && !isEditing && (
          <Badge variant="success" size="sm">
            Set
          </Badge>
        )}
      </HStack>

      {isEditing || !isSet ? (
        <VStack spacing="sm">
          <div
            className={`bg-charcoal border px-4 py-3 ${error ? 'border-coral-500' : 'border-neutral-700'}`}
            style={organicBorderRadius.input}
          >
            <input
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              type="password"
              disabled={isSaving}
              className="text-white font-mono text-sm"
            />
          </div>
          {error && (
            <Text size="sm" className="text-coral-500">
              {error}
            </Text>
          )}
          <HStack spacing="sm">
            <button type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={`flex-1 py-3 ${canSave ? 'bg-teal-600 active:bg-teal-700' : 'bg-neutral-700'}`}
              style={organicBorderRadius.button}
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Text
                  className={`text-center font-semibold ${canSave ? 'text-white' : 'text-neutral-500'}`}
                >
                  Save
                </Text>
              )}
            </button>
            {isSet && (
              <button type="button"
                onClick={() => {
                  setIsEditing(false);
                  onChange('');
                }}
                disabled={isSaving}
                className="flex-1 bg-surface py-3 active:bg-neutral-700"
                style={organicBorderRadius.button}
              >
                <Text className="text-center text-white">Cancel</Text>
              </button>
            )}
          </HStack>
        </VStack>
      ) : (
        <button type="button"
          onClick={() => setIsEditing(true)}
          className="bg-charcoal border border-neutral-700 px-4 py-3"
          style={organicBorderRadius.input}
        >
          <Text className="text-neutral-500">••••••••••••••••</Text>
        </button>
      )}
    </div>
  );
}
