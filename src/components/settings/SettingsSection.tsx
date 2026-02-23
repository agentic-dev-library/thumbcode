/**
 * SettingsSection
 *
 * A labeled section wrapper for settings screens with a title header.
 */

import { VStack } from '@/components/layout';
import { Text } from '@/components/ui';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className = 'mb-6',
}: Readonly<SettingsSectionProps>) {
  return (
    <VStack
      spacing="none"
      className={`bg-surface rounded-organic-card overflow-hidden ${className}`}
    >
      <div className="px-4 py-3 border-b border-neutral-700">
        <Text size="sm" weight="semibold" className="text-neutral-400">
          {title}
        </Text>
      </div>
      <div className="px-4">{children}</div>
    </VStack>
  );
}
