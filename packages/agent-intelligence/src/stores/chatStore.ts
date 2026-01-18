// packages/agent-intelligence/src/stores/chatStore.ts
import { create } from 'zustand';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
