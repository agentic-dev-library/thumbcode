/**
 * ChatStore Multimodal Tests
 *
 * Tests for multimedia message types: image, document, voice_transcript,
 * mixed_media, and MediaAttachment support.
 */

import { act } from '@testing-library/react';
import type { DocumentMessage, ImageMessage, MediaAttachment, VoiceMessage } from '../chatStore';
import { useChatStore } from '../chatStore';

describe('ChatStore Multimodal', () => {
  let threadId: string;

  beforeEach(() => {
    act(() => useChatStore.getState().clearAllThreads());
    act(() => {
      threadId = useChatStore.getState().createThread({
        title: 'Multimodal Thread',
        participants: ['user', 'architect'],
        isPinned: false,
      });
      useChatStore.getState().setActiveThread(threadId);
    });
  });

  describe('image messages', () => {
    it('stores an image message with metadata', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Screenshot of the app',
          contentType: 'image',
          sender: 'user',
          metadata: {
            imageUrl: 'file:///photos/screenshot.png',
            width: 1080,
            height: 1920,
            caption: 'App home screen',
          },
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      const msg = msgs[0] as ImageMessage;
      expect(msg.contentType).toBe('image');
      expect(msg.content).toBe('Screenshot of the app');
      expect(msg.metadata).toEqual({
        imageUrl: 'file:///photos/screenshot.png',
        width: 1080,
        height: 1920,
        caption: 'App home screen',
      });
    });

    it('retrieves image messages from thread', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Here is a screenshot',
          contentType: 'image',
          sender: 'user',
          metadata: {
            imageUrl: 'data:image/png;base64,abc123',
          },
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      const imageMsg = msgs.find((m) => m.contentType === 'image');
      expect(imageMsg).toBeDefined();
      expect((imageMsg?.metadata as ImageMessage['metadata']).imageUrl).toBe(
        'data:image/png;base64,abc123'
      );
    });
  });

  describe('document messages', () => {
    it('stores a document message with file metadata', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Project requirements document',
          contentType: 'document',
          sender: 'architect',
          metadata: {
            filename: 'requirements.pdf',
            mimeType: 'application/pdf',
            size: 245760,
          },
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      const msg = msgs[0] as DocumentMessage;
      expect(msg.contentType).toBe('document');
      expect(msg.metadata).toEqual({
        filename: 'requirements.pdf',
        mimeType: 'application/pdf',
        size: 245760,
      });
    });
  });

  describe('voice transcript messages', () => {
    it('stores a voice transcript with audio metadata', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Please add a login screen with email and password fields',
          contentType: 'voice_transcript',
          sender: 'user',
          metadata: {
            audioUrl: 'file:///recordings/voice-001.wav',
            duration: 5.2,
          },
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      const msg = msgs[0] as VoiceMessage;
      expect(msg.contentType).toBe('voice_transcript');
      expect(msg.content).toBe('Please add a login screen with email and password fields');
      expect(msg.metadata).toEqual({
        audioUrl: 'file:///recordings/voice-001.wav',
        duration: 5.2,
      });
    });
  });

  describe('mixed media messages', () => {
    it('stores a mixed_media message', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Here are the wireframes and notes',
          contentType: 'mixed_media',
          sender: 'user',
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      expect(msgs[0].contentType).toBe('mixed_media');
    });
  });

  describe('media attachments', () => {
    it('stores a message with attachments', () => {
      const attachments: MediaAttachment[] = [
        {
          id: 'att-1',
          type: 'image',
          uri: 'file:///photos/screenshot.png',
          mimeType: 'image/png',
          filename: 'screenshot.png',
          size: 102400,
          thumbnail: 'data:image/png;base64,thumb1',
        },
        {
          id: 'att-2',
          type: 'document',
          uri: 'file:///docs/spec.pdf',
          mimeType: 'application/pdf',
          filename: 'spec.pdf',
          size: 512000,
        },
      ];

      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Files attached',
          contentType: 'mixed_media',
          sender: 'user',
          attachments,
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      expect(msgs[0].attachments).toHaveLength(2);
      expect(msgs[0].attachments?.[0].type).toBe('image');
      expect(msgs[0].attachments?.[0].filename).toBe('screenshot.png');
      expect(msgs[0].attachments?.[1].type).toBe('document');
      expect(msgs[0].attachments?.[1].mimeType).toBe('application/pdf');
    });

    it('stores audio attachment', () => {
      const attachments: MediaAttachment[] = [
        {
          id: 'att-audio-1',
          type: 'audio',
          uri: 'file:///recordings/voice.wav',
          mimeType: 'audio/wav',
          size: 88200,
        },
      ];

      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Voice note',
          contentType: 'voice_transcript',
          sender: 'user',
          attachments,
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs[0].attachments).toHaveLength(1);
      expect(msgs[0].attachments?.[0].type).toBe('audio');
    });

    it('messages without attachments have undefined attachments', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Plain text',
          contentType: 'text',
          sender: 'user',
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs[0].attachments).toBeUndefined();
    });
  });

  describe('backward compatibility', () => {
    it('existing text messages still work', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Hello',
          contentType: 'text',
          sender: 'user',
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs).toHaveLength(1);
      expect(msgs[0].contentType).toBe('text');
      expect(msgs[0].content).toBe('Hello');
    });

    it('existing code messages still work', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'console.log("test")',
          contentType: 'code',
          sender: 'implementer',
          metadata: { language: 'typescript', filename: 'app.ts' },
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs[0].contentType).toBe('code');
    });

    it('existing approval messages still work', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Approve commit?',
          contentType: 'approval_request',
          sender: 'implementer',
          metadata: {
            actionType: 'commit',
            actionDescription: 'Initial commit',
          },
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      expect(msgs[0].contentType).toBe('approval_request');
    });
  });

  describe('serialization', () => {
    it('multimedia messages serialize correctly via JSON', () => {
      act(() => {
        useChatStore.getState().addMessage({
          threadId,
          content: 'Image with attachments',
          contentType: 'image',
          sender: 'user',
          metadata: { imageUrl: 'data:image/png;base64,abc' },
          attachments: [
            {
              id: 'att-1',
              type: 'image',
              uri: 'file:///photo.png',
              mimeType: 'image/png',
            },
          ],
        });
      });

      const msgs = useChatStore.getState().messages[threadId];
      const json = JSON.stringify(msgs[0]);
      const parsed = JSON.parse(json);

      expect(parsed.contentType).toBe('image');
      expect(parsed.metadata.imageUrl).toBe('data:image/png;base64,abc');
      expect(parsed.attachments).toHaveLength(1);
      expect(parsed.attachments[0].type).toBe('image');
    });
  });
});
