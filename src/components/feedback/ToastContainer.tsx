import { useToastStore } from '@/state/toastStore';
import { Toast } from './Toast';

export function ToastContainer() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <Toast
      visible={current !== null}
      message={current?.message ?? ''}
      title={current?.title}
      variant={current?.variant ?? 'info'}
      duration={current?.duration ?? 4000}
      position="bottom"
      onDismiss={dismiss}
    />
  );
}
