/**
 * DocumentEngine Tests
 *
 * Verifies that each format (docx, pptx, xlsx, pdf) generates valid blobs.
 * Libraries are mocked to avoid pulling in heavy dependencies in tests.
 */

import { DocumentEngine } from '../DocumentEngine';
import type { DocumentContent } from '../types';

// Mock docx
vi.mock('docx', () => {
  const HeadingLevel = {
    TITLE: 'TITLE',
    HEADING_1: 'HEADING_1',
    HEADING_2: 'HEADING_2',
    HEADING_3: 'HEADING_3',
  };

  class MockDocument {}
  class MockParagraph {}
  class MockTextRun {}

  return {
    Document: MockDocument,
    HeadingLevel,
    Packer: {
      toBlob: vi.fn().mockResolvedValue(
        new Blob(['docx-content'], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      ),
    },
    Paragraph: MockParagraph,
    TextRun: MockTextRun,
  };
});

// Mock pptxgenjs
vi.mock('pptxgenjs', () => {
  class MockPptxGenJS {
    title = '';
    author = '';
    addSlide = vi.fn().mockReturnValue({
      addText: vi.fn(),
      addNotes: vi.fn(),
    });
    write = vi.fn().mockResolvedValue(
      new Blob(['pptx-content'], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
    );
  }
  return { default: MockPptxGenJS };
});

// Mock exceljs
vi.mock('exceljs', () => {
  const mockWorksheet = {
    columns: [] as unknown[],
    getRow: vi.fn().mockReturnValue({ font: {} }),
    addRow: vi.fn(),
  };

  class MockWorkbook {
    creator = '';
    title = '';
    addWorksheet = vi.fn().mockReturnValue(mockWorksheet);
    xlsx = {
      writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(64)),
    };
  }

  return {
    default: { Workbook: MockWorkbook },
  };
});

// Mock jspdf
vi.mock('jspdf', () => {
  class MockJsPDF {
    internal = {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
    };
    setFontSize = vi.fn();
    setTextColor = vi.fn();
    text = vi.fn();
    splitTextToSize = vi.fn().mockReturnValue(['line1', 'line2']);
    addPage = vi.fn();
    output = vi.fn().mockReturnValue(new Blob(['pdf-content'], { type: 'application/pdf' }));
  }
  return { jsPDF: MockJsPDF };
});

describe('DocumentEngine', () => {
  let engine: DocumentEngine;

  beforeEach(() => {
    engine = new DocumentEngine();
  });

  describe('generate', () => {
    it('should generate a docx blob with correct metadata', async () => {
      const content: DocumentContent = {
        title: 'Test Document',
        author: 'Agent',
        format: 'docx',
        sections: [
          { heading: 'Introduction', content: 'Hello world', level: 1 },
          { content: 'Body text without heading' },
        ],
      };

      const result = await engine.generate(content);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('test-document.docx');
      expect(result.format).toBe('docx');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should generate a pptx blob from slides', async () => {
      const content: DocumentContent = {
        title: 'Test Presentation',
        format: 'pptx',
        slides: [
          { title: 'Slide 1', bullets: ['Point A', 'Point B'], notes: 'Speaker notes' },
          { title: 'Slide 2' },
        ],
      };

      const result = await engine.generate(content);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('test-presentation.pptx');
      expect(result.format).toBe('pptx');
    });

    it('should generate a pptx with title-only slide when no slides provided', async () => {
      const content: DocumentContent = {
        title: 'Empty Pres',
        format: 'pptx',
      };

      const result = await engine.generate(content);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('empty-pres.pptx');
    });

    it('should generate an xlsx blob from sheet data', async () => {
      const content: DocumentContent = {
        title: 'Test Spreadsheet',
        format: 'xlsx',
        sheets: [
          {
            sheetName: 'Data',
            headers: ['Name', 'Value'],
            rows: [
              ['Alpha', 100],
              ['Beta', 200],
            ],
          },
        ],
      };

      const result = await engine.generate(content);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('test-spreadsheet.xlsx');
      expect(result.format).toBe('xlsx');
    });

    it('should generate an xlsx with default sheet when no sheets provided', async () => {
      const content: DocumentContent = {
        title: 'Empty Sheet',
        format: 'xlsx',
      };

      const result = await engine.generate(content);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('empty-sheet.xlsx');
    });

    it('should generate a pdf blob from sections', async () => {
      const content: DocumentContent = {
        title: 'Test PDF',
        author: 'Tester',
        format: 'pdf',
        sections: [
          { heading: 'Chapter 1', content: 'Some text here.', level: 1 },
          { heading: 'Section 1.1', content: 'More text.', level: 2 },
        ],
      };

      const result = await engine.generate(content);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.filename).toBe('test-pdf.pdf');
      expect(result.format).toBe('pdf');
    });

    it('should throw for unsupported format', async () => {
      const content = {
        title: 'Bad Format',
        format: 'rtf' as 'docx',
      };

      await expect(engine.generate(content)).rejects.toThrow('Unsupported format');
    });

    it('should sanitize titles into safe filenames', async () => {
      const content: DocumentContent = {
        title: 'My Report: Q4 2024 (Final)',
        format: 'pdf',
      };

      const result = await engine.generate(content);

      expect(result.filename).toBe('my-report-q4-2024-final.pdf');
    });

    it('should use default filename when title produces empty string', async () => {
      const content: DocumentContent = {
        title: '!!!',
        format: 'docx',
      };

      const result = await engine.generate(content);

      expect(result.filename).toBe('document.docx');
    });
  });
});
