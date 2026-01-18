import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  // Add any other properties your messages might have
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    immer((set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => {
          state.messages.push(message);
        }),
    })),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
