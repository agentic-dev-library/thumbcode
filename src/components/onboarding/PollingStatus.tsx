/**
 * PollingStatus
 *
 * Displays polling attempt progress and error messages during GitHub auth.
 */

import { Text } from '@/components/ui';

interface PollingStatusProps {
  pollStatus: { attempt: number; max: number } | null;
  errorMessage: string | null;
}

export function PollingStatus({ pollStatus, errorMessage }: Readonly<PollingStatusProps>) {
  return (
    <>
      {pollStatus && (
        <Text size="sm" className="text-neutral-500 text-center">
          Checking authorization… {pollStatus.attempt}/{pollStatus.max}
        </Text>
      )}
      {errorMessage && (
        <Text size="sm" className="text-coral-400 text-center">
          {errorMessage}
        </Text>
      )}
    </>
  );
}
