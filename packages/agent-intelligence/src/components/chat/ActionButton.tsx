interface ActionButtonProps {
  title: string;
  onPress: () => void;
}

const ActionButton = ({ title, onPress }: ActionButtonProps) => {
  return (
    <button
      type="button"
      className="bg-gold-400 py-2 px-3 mx-1 active:bg-gold-600 rounded-organic-badge"
      onClick={onPress}
    >
      <span className="text-charcoal font-body font-bold text-sm">{title}</span>
    </button>
  );
};

export default ActionButton;
