import { View } from 'react-native';
import { Icon } from '../icons/Icon';
import { Text } from '../primitives/Text';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  type: AlertType;
  title?: string;
}

/**
 * An alert component for displaying status messages.
 * Uses ThumbCode's P3 color palette for different alert types.
 *
 * @param message - The alert message to display.
 * @param type - The type of alert: 'success', 'error', 'warning', or 'info'.
 * @param title - Optional title text displayed above the message.
 * @returns A View element styled as an alert with icon and message.
 */
export function Alert({ message, type, title }: AlertProps) {
  const config = {
    success: { bg: 'bg-teal-600', icon: 'alertSuccess' as const },
    error: { bg: 'bg-coral-500', icon: 'alertError' as const },
    warning: { bg: 'bg-gold-400', icon: 'alertWarning' as const },
    info: { bg: 'bg-neutral-600', icon: 'alertInfo' as const },
  }[type];

  const accessibilityLabel = title ? `${title}, ${message}` : message;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
      className={`${config.bg} p-4 flex-row items-center rounded-[0.6rem_0.8rem_0.7rem_0.9rem]`}
    >
      <Icon name={config.icon} size={24} color="white" />
      <View className="ml-3 flex-1">
        {title && (
          <Text weight="semibold" className="text-white mb-1">
            {title}
          </Text>
        )}
        <Text className="text-white">{message}</Text>
      </View>
    </View>
  );
}
