/**
 * Multimodal Content Types Tests
 *
 * Tests for image, document, and audio content block types
 * and their serialization through formatContentBlocks.
 */

import type {
  AudioContentBlock,
  ContentBlock,
  DocumentContentBlock,
  ImageContentBlock,
  ImageSource,
} from '../types';

describe('Multimodal Content Types', () => {
  describe('ImageSource', () => {
    it('supports base64 image source', () => {
      const source: ImageSource = {
        type: 'base64',
        mediaType: 'image/png',
        data: 'iVBORw0KGgoAAAANSUhEUg==',
      };
      expect(source.type).toBe('base64');
      expect(source.mediaType).toBe('image/png');
      expect(source.data).toBeDefined();
    });

    it('supports url image source', () => {
      const source: ImageSource = {
        type: 'url',
        mediaType: 'image/jpeg',
        data: 'https://example.com/image.jpg',
      };
      expect(source.type).toBe('url');
      expect(source.mediaType).toBe('image/jpeg');
    });

    it('supports file_id image source', () => {
      const source: ImageSource = {
        type: 'file_id',
        mediaType: 'image/webp',
        data: 'file-abc-123',
      };
      expect(source.type).toBe('file_id');
      expect(source.mediaType).toBe('image/webp');
    });
  });

  describe('ImageContentBlock', () => {
    it('creates an image content block', () => {
      const block: ImageContentBlock = {
        type: 'image',
        source: {
          type: 'base64',
          mediaType: 'image/png',
          data: 'iVBORw0KGgoAAAANSUhEUg==',
        },
      };
      expect(block.type).toBe('image');
      expect(block.source.type).toBe('base64');
      expect(block.source.mediaType).toBe('image/png');
    });
  });

  describe('DocumentContentBlock', () => {
    it('creates a document content block', () => {
      const block: DocumentContentBlock = {
        type: 'document',
        source: {
          type: 'base64',
          mediaType: 'application/pdf',
          data: 'JVBERi0xLjQK',
        },
        filename: 'report.pdf',
      };
      expect(block.type).toBe('document');
      expect(block.source.mediaType).toBe('application/pdf');
      expect(block.filename).toBe('report.pdf');
    });

    it('allows document without filename', () => {
      const block: DocumentContentBlock = {
        type: 'document',
        source: {
          type: 'url',
          mediaType: 'application/pdf',
          data: 'https://example.com/doc.pdf',
        },
      };
      expect(block.filename).toBeUndefined();
    });
  });

  describe('AudioContentBlock', () => {
    it('creates an audio content block', () => {
      const block: AudioContentBlock = {
        type: 'audio',
        source: {
          type: 'base64',
          mediaType: 'audio/wav',
          data: 'UklGRiQAAABXQVZF',
        },
        transcript: 'Hello world',
      };
      expect(block.type).toBe('audio');
      expect(block.source.mediaType).toBe('audio/wav');
      expect(block.transcript).toBe('Hello world');
    });

    it('allows audio without transcript', () => {
      const block: AudioContentBlock = {
        type: 'audio',
        source: {
          type: 'base64',
          mediaType: 'audio/mp3',
          data: 'SUQzBAAAAAAAI1RTU0U=',
        },
      };
      expect(block.transcript).toBeUndefined();
    });
  });

  describe('ContentBlock union', () => {
    it('supports image type in ContentBlock', () => {
      const block: ContentBlock = {
        type: 'image',
        source: {
          type: 'base64',
          mediaType: 'image/jpeg',
          data: '/9j/4AAQSkZJRg==',
        },
      };
      expect(block.type).toBe('image');
      expect(block.source).toBeDefined();
    });

    it('supports document type in ContentBlock', () => {
      const block: ContentBlock = {
        type: 'document',
        source: {
          type: 'base64',
          mediaType: 'application/pdf',
          data: 'JVBERi0xLjQK',
        },
        filename: 'test.pdf',
      };
      expect(block.type).toBe('document');
      expect(block.filename).toBe('test.pdf');
    });

    it('supports audio type in ContentBlock', () => {
      const block: ContentBlock = {
        type: 'audio',
        source: {
          type: 'base64',
          mediaType: 'audio/webm',
          data: 'GkXfo59ChoEBQveBAULygQRC84EI',
        },
        transcript: 'Test transcript',
      };
      expect(block.type).toBe('audio');
      expect(block.transcript).toBe('Test transcript');
    });

    it('preserves backward compatibility with text blocks', () => {
      const block: ContentBlock = {
        type: 'text',
        text: 'Hello, world!',
      };
      expect(block.type).toBe('text');
      expect(block.text).toBe('Hello, world!');
    });

    it('preserves backward compatibility with tool_use blocks', () => {
      const block: ContentBlock = {
        type: 'tool_use',
        id: 'tool-123',
        name: 'read_file',
        input: { path: '/test.txt' },
      };
      expect(block.type).toBe('tool_use');
      expect(block.id).toBe('tool-123');
    });

    it('serializes and deserializes content blocks', () => {
      const blocks: ContentBlock[] = [
        { type: 'text', text: 'Look at this image:' },
        {
          type: 'image',
          source: {
            type: 'base64',
            mediaType: 'image/png',
            data: 'iVBORw0KGgo=',
          },
        },
        {
          type: 'document',
          source: {
            type: 'base64',
            mediaType: 'application/pdf',
            data: 'JVBERi0=',
          },
          filename: 'readme.pdf',
        },
      ];

      const json = JSON.stringify(blocks);
      const parsed = JSON.parse(json) as ContentBlock[];

      expect(parsed).toHaveLength(3);
      expect(parsed[0].type).toBe('text');
      expect(parsed[1].type).toBe('image');
      expect(parsed[1].source?.mediaType).toBe('image/png');
      expect(parsed[2].type).toBe('document');
      expect(parsed[2].filename).toBe('readme.pdf');
    });
  });
});
