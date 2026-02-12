import { GitService } from '@thumbcode/core';
import { useChatStore, useProjectStore, useUserStore } from '@thumbcode/state';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import ChatScreen from '../chat';

// Mock dependencies
jest.mock('@thumbcode/core', () => ({
  GitService: {
    stage: jest.fn(),
    commit: jest.fn(),
  },
}));

jest.mock('@thumbcode/state', () => ({
  useChatStore: jest.fn(),
  useProjectStore: jest.fn(),
  useUserStore: jest.fn(),
}));

jest.mock('@/components/chat', () => ({
  ChatMessage: jest.fn(() => null),
  ChatInput: () => null,
  ThreadList: () => null,
}));

jest.mock('@/services/chat', () => ({
  ChatService: {
    createThread: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ChatScreen Approval Logic', () => {
  const mockRespondToApproval = jest.fn();
  const mockSetActiveThread = jest.fn();
  let ChatMessageMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mock function
    const ChatComponents = require('@/components/chat');
    ChatMessageMock = ChatComponents.ChatMessage;
    ChatMessageMock.mockClear();

    // Default mock implementation for ChatStore
    (useChatStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        activeThreadId: 'thread-1',
        setActiveThread: mockSetActiveThread,
        respondToApproval: mockRespondToApproval,
        threads: [{ id: 'thread-1', title: 'Test Thread', projectId: 'project-1' }],
        messages: {
          'thread-1': [
            {
              id: 'msg-1',
              threadId: 'thread-1',
              sender: 'architect',
              content: 'Please approve commit',
              contentType: 'approval_request',
              status: 'delivered',
              timestamp: '2023-01-01T00:00:00Z',
              metadata: {
                actionType: 'commit',
                actionDescription: 'feat: new feature',
              },
            },
          ],
        },
        isTyping: {},
      };
      return selector(state);
    });

    (useProjectStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        projects: [{ id: 'project-1', localPath: '/mock/repo' }],
      };
      return selector(state);
    });

    (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        githubProfile: { name: 'Test User', email: 'test@example.com', login: 'testuser' },
      };
      return selector(state);
    });
  });

  it('stages and commits changes when approved', async () => {
    render(<ChatScreen />);

    // Verify ChatMessage was rendered
    expect(ChatMessageMock).toHaveBeenCalled();
    const { onApprovalResponse } = ChatMessageMock.mock.calls[0][0];

    // Trigger approval
    await onApprovalResponse('msg-1', true);

    await waitFor(() => {
      expect(GitService.stage).toHaveBeenCalledWith({
        dir: '/mock/repo',
        filepath: '.',
      });
      expect(GitService.commit).toHaveBeenCalledWith({
        dir: '/mock/repo',
        message: 'feat: new feature',
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      });
      expect(mockRespondToApproval).toHaveBeenCalledWith('msg-1', 'thread-1', true);
    });
  });

  it('shows error alert if repo path is missing', async () => {
    (useProjectStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        projects: [],
      };
      return selector(state);
    });

    render(<ChatScreen />);

    expect(ChatMessageMock).toHaveBeenCalled();
    const { onApprovalResponse } = ChatMessageMock.mock.calls[0][0];

    await onApprovalResponse('msg-1', true);

    await waitFor(() => {
      expect(GitService.stage).not.toHaveBeenCalled();
      expect(GitService.commit).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No repository path found for project');
      expect(mockRespondToApproval).not.toHaveBeenCalled();
    });
  });

  it('shows error alert if commit fails', async () => {
    (GitService.commit as jest.Mock).mockRejectedValueOnce(new Error('Git error'));

    render(<ChatScreen />);

    expect(ChatMessageMock).toHaveBeenCalled();
    const { onApprovalResponse } = ChatMessageMock.mock.calls[0][0];

    await onApprovalResponse('msg-1', true);

    await waitFor(() => {
      expect(GitService.stage).toHaveBeenCalled();
      expect(GitService.commit).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Commit Failed', 'Git error');
      expect(mockRespondToApproval).not.toHaveBeenCalled();
    });
  });

  it('does not commit if rejected (approved=false)', async () => {
    render(<ChatScreen />);

    expect(ChatMessageMock).toHaveBeenCalled();
    const { onApprovalResponse } = ChatMessageMock.mock.calls[0][0];

    await onApprovalResponse('msg-1', false);

    await waitFor(() => {
      expect(GitService.stage).not.toHaveBeenCalled();
      expect(GitService.commit).not.toHaveBeenCalled();
      expect(mockRespondToApproval).toHaveBeenCalledWith('msg-1', 'thread-1', false);
    });
  });
});
