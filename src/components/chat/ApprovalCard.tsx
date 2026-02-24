/**
 * Approval Card Component
 *
 * Displays approval requests from agents with approve/reject actions.
 * Uses organic styling with distinctive visual treatment for pending actions.
 * Uses paint daube icons for brand consistency.
 */

import type { ApprovalMessage } from '@/state';
import type React from 'react';
import { useMemo } from 'react';
import {
  BranchIcon,
  EditIcon,
  FileIcon,
  GitIcon,
  type IconColor,
  LightningIcon,
} from '@/components/icons';
import { Text } from '@/components/ui';
import { getColor } from '@/utils/design-tokens';

/** Action icon component type */
type ActionIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

/** Props for the ApprovalCard component */
interface ApprovalCardProps {
  /** The approval message to display */
  message: ApprovalMessage;
  /** Called when the user approves the action */
  onApprove: () => void;
  /** Called when the user rejects the action */
  onReject: () => void;
}

interface ActionInfo {
  Icon: ActionIconComponent;
  iconColor: IconColor;
  label: string;
  bgColor: string;
}

/**
 * Get action type icon and label
 */
function getActionInfo(actionType: ApprovalMessage['metadata']['actionType']): ActionInfo {
  const actionMap: Record<ApprovalMessage['metadata']['actionType'], ActionInfo> = {
    commit: { Icon: EditIcon, iconColor: 'teal', label: 'Commit Changes', bgColor: 'bg-teal-500' },
    push: { Icon: GitIcon, iconColor: 'coral', label: 'Push to Remote', bgColor: 'bg-coral-500' },
    merge: { Icon: BranchIcon, iconColor: 'gold', label: 'Merge Branch', bgColor: 'bg-gold-500' },
    deploy: { Icon: LightningIcon, iconColor: 'coral', label: 'Deploy', bgColor: 'bg-coral-600' },
    file_change: {
      Icon: FileIcon,
      iconColor: 'teal',
      label: 'File Changes',
      bgColor: 'bg-teal-600',
    },
  };
  return actionMap[actionType] || actionMap.commit;
}

export function ApprovalCard({ message, onApprove, onReject }: Readonly<ApprovalCardProps>) {
  const actionInfo = getActionInfo(message.metadata.actionType);
  const isPending = message.metadata.approved === undefined;
  const wasApproved = message.metadata.approved === true;

  const cardStyle = useMemo(
    () => ({
      borderLeftWidth: 4,
      borderLeftColor: isPending
        ? getColor('gold', '400') // Gold for pending
        : wasApproved
          ? getColor('teal', '500') // Teal for approved
          : getColor('coral', '500'), // Coral for rejected
    }),
    [isPending, wasApproved]
  );

  return (
    <div className="bg-surface-elevated p-4 max-w-[90%] rounded-organic-card" style={cardStyle}>
      {/* Header */}
      <div className="flex flex-row items-center mb-2">
        <div className="mr-2">
          <actionInfo.Icon size={20} color={actionInfo.iconColor} turbulence={0.2} />
        </div>
        <Text variant="display" className="text-base text-white flex-1">
          {actionInfo.label}
        </Text>
        {!isPending && (
          <div
            className={`px-2 py-0.5 rounded-organic-badge ${wasApproved ? 'bg-teal-600' : 'bg-coral-500'}`}
          >
            <Text className="text-xs font-body text-white">
              {wasApproved ? 'Approved' : 'Rejected'}
            </Text>
          </div>
        )}
      </div>

      {/* Description */}
      <Text className="font-body text-sm text-neutral-300 mb-3">
        {message.metadata.actionDescription}
      </Text>

      {/* Action buttons - only shown when pending */}
      {isPending && (
        <div className="flex flex-row justify-end space-x-2 pt-2 border-t border-neutral-700">
          <button
            type="button"
            onClick={onReject}
            className="px-4 py-2 bg-neutral-700 active:bg-neutral-600 rounded-organic-button"
            aria-label="Reject"
            aria-description="Reject this action"
          >
            <Text className="font-body text-sm text-neutral-200">Reject</Text>
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="px-4 py-2 bg-teal-600 active:bg-teal-700 ml-2 rounded-organic-button"
            aria-label="Approve"
            aria-description="Approve this action"
          >
            <Text className="font-body text-sm text-white font-semibold">Approve</Text>
          </button>
        </div>
      )}

      {/* Response timestamp */}
      {!isPending && message.metadata.respondedAt && (
        <Text className="text-xs text-neutral-500 mt-2">
          Responded at{' '}
          {new Date(message.metadata.respondedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </div>
  );
}
