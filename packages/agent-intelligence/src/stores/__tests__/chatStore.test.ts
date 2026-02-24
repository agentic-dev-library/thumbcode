import { act } from '@testing-library/react';
import { useChatStore } from '../chatStore';

describe('agent-intelligence chatStore', () => {
  beforeEach(() => {
    act(() => useChatStore.setState({ messages: [] }));
  });

  it('starts with empty messages', () => {
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it('adds a message', () => {
    act(() => {
      useChatStore.getState().addMessage({
        id: 'msg-1',
        text: 'Hello',
        sender: 'user',
        timestamp: new Date(),
      });
    });
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0].text).toBe('Hello');
  });

  it('adds multiple messages', () => {
    act(() => {
      useChatStore.getState().addMessage({
        id: 'msg-1',
        text: 'First',
        sender: 'user',
        timestamp: new Date(),
      });
      useChatStore.getState().addMessage({
        id: 'msg-2',
        text: 'Second',
        sender: 'agent',
        timestamp: new Date(),
      });
    });
    expect(useChatStore.getState().messages).toHaveLength(2);
  });
});
