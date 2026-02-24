/**
 * Document Tool Tests
 *
 * Verifies the document generation tools (create_document, create_presentation,
 * create_spreadsheet, create_pdf) in the ToolExecutionBridge.
 */

import { ToolExecutionBridge } from '../ToolExecutionBridge';
import type { DocumentEngineLike, ToolBridgeDependencies } from '../types';

function createMockDeps(documentEngine?: DocumentEngineLike): ToolBridgeDependencies {
  return {
    diffService: {
      status: vi.fn().mockResolvedValue({ success: true, data: [] }),
      diff: vi.fn().mockResolvedValue({
        success: true,
        data: { files: [], stats: { filesChanged: 0, additions: 0, deletions: 0 } },
      }),
      diffWorkingDir: vi.fn().mockResolvedValue({
        success: true,
        data: { files: [], stats: { filesChanged: 0, additions: 0, deletions: 0 } },
      }),
    },
    cloneService: {
      isRepository: vi.fn().mockResolvedValue(true),
      getHead: vi.fn().mockResolvedValue({ success: true, data: 'abc123' }),
    },
    branchService: {
      currentBranch: vi.fn().mockResolvedValue({ success: true, data: 'main' }),
      listBranches: vi.fn().mockResolvedValue({ success: true, data: [] }),
    },
    commitService: {
      log: vi.fn().mockResolvedValue({ success: true, data: [] }),
      stage: vi.fn().mockResolvedValue({ success: true }),
      unstage: vi.fn().mockResolvedValue({ success: true }),
      commit: vi.fn().mockResolvedValue({ success: true, data: 'sha123' }),
    },
    fileSystem: {
      readFile: vi.fn().mockRejectedValue(new Error('ENOENT')),
      readDir: vi.fn().mockResolvedValue([]),
      stat: vi.fn().mockRejectedValue(new Error('ENOENT')),
      writeFile: vi.fn().mockResolvedValue(undefined),
      deleteFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
    },
    documentEngine,
  };
}

function createMockEngine(): DocumentEngineLike {
  return {
    generate: vi.fn().mockResolvedValue({
      blob: new Blob(['test']),
      filename: 'test-doc.docx',
      format: 'docx',
      size: 4,
      blobUrl: 'blob:http://localhost/abc',
    }),
  };
}

describe('ToolExecutionBridge - Document Tools', () => {
  const workspaceDir = '/workspace';

  describe('when documentEngine is not configured', () => {
    it('should return error for create_document', async () => {
      const bridge = new ToolExecutionBridge(createMockDeps());
      const result = await bridge.execute('create_document', { title: 'Test' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should return error for create_presentation', async () => {
      const bridge = new ToolExecutionBridge(createMockDeps());
      const result = await bridge.execute('create_presentation', { title: 'Test' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should return error for create_spreadsheet', async () => {
      const bridge = new ToolExecutionBridge(createMockDeps());
      const result = await bridge.execute('create_spreadsheet', { title: 'Test' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should return error for create_pdf', async () => {
      const bridge = new ToolExecutionBridge(createMockDeps());
      const result = await bridge.execute('create_pdf', { title: 'Test' }, workspaceDir);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });
  });

  describe('when documentEngine is configured', () => {
    let engine: DocumentEngineLike;
    let bridge: ToolExecutionBridge;

    beforeEach(() => {
      engine = createMockEngine();
      bridge = new ToolExecutionBridge(createMockDeps(engine));
    });

    describe('create_document', () => {
      it('should generate a docx and return metadata', async () => {
        const result = await bridge.execute(
          'create_document',
          {
            title: 'My Report',
            author: 'Agent',
            sections: [{ heading: 'Intro', content: 'Hello', level: 1 }],
          },
          workspaceDir
        );

        expect(result.success).toBe(true);
        const output = JSON.parse(result.output);
        expect(output.filename).toBe('test-doc.docx');
        expect(output.title).toBe('My Report');
        expect(engine.generate).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'My Report', format: 'docx' })
        );
      });

      it('should return error when title is missing', async () => {
        const result = await bridge.execute('create_document', {}, workspaceDir);

        expect(result.success).toBe(false);
        expect(result.error).toContain('requires a "title" parameter');
      });
    });

    describe('create_presentation', () => {
      it('should generate a pptx and return metadata', async () => {
        vi.mocked(engine.generate).mockResolvedValueOnce({
          blob: new Blob(['pptx']),
          filename: 'deck.pptx',
          format: 'pptx',
          size: 512,
          blobUrl: 'blob:http://localhost/pptx',
        });

        const result = await bridge.execute(
          'create_presentation',
          {
            title: 'Q4 Review',
            slides: [{ title: 'Slide 1', bullets: ['A', 'B'] }],
          },
          workspaceDir
        );

        expect(result.success).toBe(true);
        const output = JSON.parse(result.output);
        expect(output.filename).toBe('deck.pptx');
        expect(engine.generate).toHaveBeenCalledWith(expect.objectContaining({ format: 'pptx' }));
      });

      it('should return error when title is missing', async () => {
        const result = await bridge.execute('create_presentation', {}, workspaceDir);

        expect(result.success).toBe(false);
        expect(result.error).toContain('requires a "title" parameter');
      });
    });

    describe('create_spreadsheet', () => {
      it('should generate an xlsx and return metadata', async () => {
        vi.mocked(engine.generate).mockResolvedValueOnce({
          blob: new Blob(['xlsx']),
          filename: 'data.xlsx',
          format: 'xlsx',
          size: 256,
          blobUrl: 'blob:http://localhost/xlsx',
        });

        const result = await bridge.execute(
          'create_spreadsheet',
          {
            title: 'Sales Data',
            sheets: [{ sheetName: 'Q4', headers: ['Name', 'Amount'], rows: [['A', 100]] }],
          },
          workspaceDir
        );

        expect(result.success).toBe(true);
        const output = JSON.parse(result.output);
        expect(output.filename).toBe('data.xlsx');
        expect(engine.generate).toHaveBeenCalledWith(expect.objectContaining({ format: 'xlsx' }));
      });

      it('should return error when title is missing', async () => {
        const result = await bridge.execute('create_spreadsheet', {}, workspaceDir);

        expect(result.success).toBe(false);
        expect(result.error).toContain('requires a "title" parameter');
      });
    });

    describe('create_pdf', () => {
      it('should generate a pdf and return metadata', async () => {
        vi.mocked(engine.generate).mockResolvedValueOnce({
          blob: new Blob(['pdf']),
          filename: 'report.pdf',
          format: 'pdf',
          size: 1024,
          blobUrl: 'blob:http://localhost/pdf',
        });

        const result = await bridge.execute(
          'create_pdf',
          { title: 'Annual Report', sections: [{ content: 'Text here' }] },
          workspaceDir
        );

        expect(result.success).toBe(true);
        const output = JSON.parse(result.output);
        expect(output.filename).toBe('report.pdf');
        expect(engine.generate).toHaveBeenCalledWith(expect.objectContaining({ format: 'pdf' }));
      });

      it('should return error when title is missing', async () => {
        const result = await bridge.execute('create_pdf', {}, workspaceDir);

        expect(result.success).toBe(false);
        expect(result.error).toContain('requires a "title" parameter');
      });
    });

    describe('error handling', () => {
      it('should catch engine errors gracefully', async () => {
        vi.mocked(engine.generate).mockRejectedValueOnce(new Error('Generation failed'));

        const result = await bridge.execute('create_document', { title: 'Bad Doc' }, workspaceDir);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Generation failed');
      });

      it('should handle non-Error thrown values', async () => {
        vi.mocked(engine.generate).mockRejectedValueOnce('unexpected');

        const result = await bridge.execute('create_document', { title: 'Bad Doc' }, workspaceDir);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to generate');
      });
    });
  });
});
