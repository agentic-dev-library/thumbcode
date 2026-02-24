/**
 * Document Engine
 *
 * Client-side document generation using pure JS libraries.
 * Generates Word (.docx), PowerPoint (.pptx), Excel (.xlsx),
 * and PDF (.pdf) files entirely in the browser.
 */

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import type { DocumentContent, DocumentFormat, DocumentResult } from './types';

/** Map of heading levels for docx generation. */
const HEADING_LEVEL_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

/** Font sizes for PDF heading levels. */
const PDF_HEADING_SIZES: Record<number, number> = { 1: 18, 2: 15, 3: 13 };

/**
 * Sanitize a title into a safe filename.
 * Replaces non-alphanumeric characters (except hyphens) with hyphens.
 */
function toFilename(title: string, format: DocumentFormat): string {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safe || 'document'}.${format}`;
}

export class DocumentEngine {
  /**
   * Generate a document in the requested format.
   * Returns the blob, filename, format, and size.
   */
  async generate(content: DocumentContent): Promise<DocumentResult> {
    let blob: Blob;

    switch (content.format) {
      case 'docx':
        blob = await this.generateDocx(content);
        break;
      case 'pptx':
        blob = await this.generatePptx(content);
        break;
      case 'xlsx':
        blob = await this.generateXlsx(content);
        break;
      case 'pdf':
        blob = await this.generatePdf(content);
        break;
      default:
        throw new Error(`Unsupported format: ${content.format}`);
    }

    return {
      blob,
      filename: toFilename(content.title, content.format),
      format: content.format,
      size: blob.size,
    };
  }

  private async generateDocx(content: DocumentContent): Promise<Blob> {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: content.title,
        heading: HeadingLevel.TITLE,
      }),
    ];

    for (const section of content.sections ?? []) {
      if (section.heading) {
        const level = section.level ?? 1;
        paragraphs.push(
          new Paragraph({
            text: section.heading,
            heading: HEADING_LEVEL_MAP[level] ?? HeadingLevel.HEADING_1,
          })
        );
      }

      // Split content by newlines into separate paragraphs
      for (const line of section.content.split('\n')) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(line)],
          })
        );
      }
    }

    const doc = new Document({
      creator: content.author ?? 'ThumbCode',
      title: content.title,
      sections: [{ children: paragraphs }],
    });

    const buffer = await Packer.toBlob(doc);
    return buffer;
  }

  private async generatePptx(content: DocumentContent): Promise<Blob> {
    const pptx = new PptxGenJS();
    pptx.title = content.title;
    if (content.author) {
      pptx.author = content.author;
    }

    const slides = content.slides ?? [];

    if (slides.length === 0) {
      // Create a title slide from the document title
      const slide = pptx.addSlide();
      slide.addText(content.title, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 2,
        fontSize: 36,
        bold: true,
        align: 'center',
      });
    }

    for (const slideContent of slides) {
      const slide = pptx.addSlide();

      // Title
      slide.addText(slideContent.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 1,
        fontSize: 28,
        bold: true,
      });

      // Bullets
      if (slideContent.bullets?.length) {
        const bulletRows = slideContent.bullets.map((text) => ({
          text,
          options: { bullet: true as const, fontSize: 18 },
        }));
        slide.addText(bulletRows, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
        });
      }

      // Speaker notes
      if (slideContent.notes) {
        slide.addNotes(slideContent.notes);
      }
    }

    const output = (await pptx.write({ outputType: 'blob' })) as Blob;
    return output;
  }

  private async generateXlsx(content: DocumentContent): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = content.author ?? 'ThumbCode';
    workbook.title = content.title;

    const sheets = content.sheets ?? [];

    if (sheets.length === 0) {
      // Create a default empty sheet
      workbook.addWorksheet(content.title);
    }

    for (const sheetData of sheets) {
      const worksheet = workbook.addWorksheet(sheetData.sheetName);

      // Add header row
      worksheet.columns = sheetData.headers.map((header) => ({
        header,
        key: header.toLowerCase().replace(/\s+/g, '_'),
        width: 20,
      }));

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };

      // Add data rows
      for (const row of sheetData.rows) {
        worksheet.addRow(row);
      }
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private async generatePdf(content: DocumentContent): Promise<Blob> {
    const doc = new jsPDF();
    const margin = 20;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(24);
    doc.text(content.title, margin, y);
    y += 14;

    // Author line
    if (content.author) {
      y = this.pdfRenderAuthor(doc, content.author, margin, y);
    }

    // Sections
    for (const section of content.sections ?? []) {
      y = this.pdfRenderSection(doc, section, margin, maxWidth, y);
    }

    return doc.output('blob');
  }

  private pdfRenderAuthor(doc: jsPDF, author: string, margin: number, y: number): number {
    doc.setFontSize(12);
    doc.setTextColor(128);
    doc.text(`Author: ${author}`, margin, y);
    doc.setTextColor(0);
    return y + 10;
  }

  private pdfRenderSection(
    doc: jsPDF,
    section: { heading?: string; content: string; level?: number },
    margin: number,
    maxWidth: number,
    y: number
  ): number {
    if (section.heading) {
      const headingSize = PDF_HEADING_SIZES[section.level ?? 1] ?? PDF_HEADING_SIZES[3];
      y += 6;
      doc.setFontSize(headingSize);
      doc.text(section.heading, margin, y);
      y += headingSize * 0.6;
    }

    doc.setFontSize(11);
    const pageBottom = doc.internal.pageSize.getHeight() - margin;
    const lines = doc.splitTextToSize(section.content, maxWidth) as string[];
    for (const line of lines) {
      if (y > pageBottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6;
    }
    return y;
  }
}
