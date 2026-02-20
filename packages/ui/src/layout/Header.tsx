import { Icon } from '../icons/Icon';
import { Text } from '../primitives/Text';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

/**
 * A header component with optional back button and right element.
 *
 * @param title - The header title text.
 * @param onBack - Optional callback for back button; shows back arrow when provided.
 * @param rightElement - Optional element to render on the right side.
 * @returns A View element styled as a header.
 */
export function Header({ title, onBack, rightElement }: HeaderProps) {
  return (
    <div className="flex-row items-center justify-between pb-4">
      <div className="w-10">
        {onBack && (
          <button type="button"
            onClick={onBack}
            className="p-2"
            role="button"
            aria-label="Back"
            aria-description="Go to previous screen"
          >
            <Icon name="back" size={24} color="white" />
          </button>
        )}
      </div>
      <Text variant="display" size="2xl" className="text-white" accessibilityRole="heading">
        {title}
      </Text>
      <div className="w-10">{rightElement}</div>
    </div>
  );
}
