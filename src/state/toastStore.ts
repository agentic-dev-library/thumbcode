import { create } from 'zustand';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastState {
  current: ToastItem | null;
  show: (options: {
    message: string;
    title?: string;
    variant?: ToastVariant;
    duration?: number;
  }) => void;
  dismiss: () => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>()((set) => ({
  current: null,
  show: ({ message, title, variant = 'info', duration = 4000 }) => {
    nextId += 1;
    set({ current: { id: String(nextId), message, title, variant, duration } });
  },
  dismiss: () => set({ current: null }),
}));

export const toast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().show({ message, title, variant: 'success' }),
  error: (message: string, title?: string) =>
    useToastStore.getState().show({ message, title, variant: 'error' }),
  warning: (message: string, title?: string) =>
    useToastStore.getState().show({ message, title, variant: 'warning' }),
  info: (message: string, title?: string) =>
    useToastStore.getState().show({ message, title, variant: 'info' }),
};
