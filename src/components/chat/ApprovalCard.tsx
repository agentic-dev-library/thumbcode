/**
 * Approval Card Component
 *
 * Displays approval requests from agents with approve/reject actions.
 * Uses organic styling with distinctive visual treatment for pending actions.
 * Uses paint daube icons for brand consistency.
 */

import type { ApprovalMessage } from '@thumbcode/state';
import { Pressable, View } from 'react-native';
import {
  BranchIcon,
  EditIcon,
  FileIcon,
  GitIcon,
  type IconColor,
  LightningIcon,
} from '@/components/icons';
import { Text } from '@/components/ui';

/** Action icon component type */
type ActionIconComponent = React.FC<{ size?: number; color?: IconColor; turbulence?: number }>;

interface ApprovalCardProps {
  message: ApprovalMessage;
  onApprove: () => void;
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

export function ApprovalCard({ message, onApprove, onReject }: ApprovalCardProps) {
  const actionInfo = getActionInfo(message.metadata.actionType);
  const isPending = message.metadata.approved === undefined;
  const wasApproved = message.metadata.approved === true;

  return (
    <View
      className="bg-surface-elevated p-4 max-w-[90%]"
      style={{
        borderRadius: '16px 12px 16px 14px',
        borderLeftWidth: 4,
        borderLeftColor: isPending
          ? '#F5D563' // Gold for pending
          : wasApproved
            ? '#14B8A6' // Teal for approved
            : '#FF7059', // Coral for rejected
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View className="mr-2">
          <actionInfo.Icon size={20} color={actionInfo.iconColor} turbulence={0.2} />
        </View>
        <Text variant="display" className="text-base text-white flex-1">
          {actionInfo.label}
        </Text>
        {!isPending && (
          <View
            className={`px-2 py-0.5 ${wasApproved ? 'bg-teal-600' : 'bg-coral-500'}`}
            style={{ borderRadius: '6px 8px 6px 8px' }}
          >
            <Text className="text-xs font-body text-white">
              {wasApproved ? 'Approved' : 'Rejected'}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text className="font-body text-sm text-neutral-300 mb-3">
        {message.metadata.actionDescription}
      </Text>

      {/* Action buttons - only shown when pending */}
      {isPending && (
        <View className="flex-row justify-end space-x-2 pt-2 border-t border-neutral-700">
          <Pressable
            onPress={onReject}
            className="px-4 py-2 bg-neutral-700 active:bg-neutral-600"
            style={{ borderRadius: '8px 10px 8px 12px' }}
            accessibilityRole="button"
            accessibilityLabel="Reject"
            accessibilityHint="Reject this action"
          >
            <Text className="font-body text-sm text-neutral-200">Reject</Text>
          </Pressable>
          <Pressable
            onPress={onApprove}
            className="px-4 py-2 bg-teal-600 active:bg-teal-700 ml-2"
            style={{ borderRadius: '8px 10px 8px 12px' }}
            accessibilityRole="button"
            accessibilityLabel="Approve"
            accessibilityHint="Approve this action"
          >
            <Text className="font-body text-sm text-white font-semibold">Approve</Text>
          </Pressable>
        </View>
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
    </View>
  );
}
