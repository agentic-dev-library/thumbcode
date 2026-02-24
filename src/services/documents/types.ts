/**
 * Document Generation Types
 *
 * Shared types for the document generation engine.
 * Supports Word documents, PowerPoint presentations,
 * Excel spreadsheets, and PDF files.
 */

/** Supported output formats. */
export type DocumentFormat = 'docx' | 'pptx' | 'xlsx' | 'pdf';

/** A section within a document (used by docx and pdf). */
export interface DocumentSection {
  heading?: string;
  content: string;
  level?: number;
}

/** Content for a single slide (used by pptx). */
export interface SlideContent {
  title: string;
  bullets?: string[];
  notes?: string;
}

/** Data for a spreadsheet sheet (used by xlsx). */
export interface SpreadsheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
}

/** Top-level document content descriptor. */
export interface DocumentContent {
  title: string;
  author?: string;
  format: DocumentFormat;
  sections?: DocumentSection[];
  slides?: SlideContent[];
  sheets?: SpreadsheetData[];
}

/** Result of a successful document generation. */
export interface DocumentResult {
  blob: Blob;
  filename: string;
  format: DocumentFormat;
  size: number;
}
