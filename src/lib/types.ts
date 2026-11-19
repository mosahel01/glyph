export type FileKind = "pdf" | "docx" | "image" | "sheet" | "text" | "other";

export type ParseStatus = "queued" | "parsing" | "done" | "error" | "canceled";

export type ParsedTable = {
  caption?: string;
  columns: string[];
  rows: string[][];
};

export type KeyValue = { key: string; value: string; confidence: number };

export type DocMeta = {
  pages: number;
  words: number;
  chars: number;
  language: string;
  ocrApplied: boolean;
  tablesFound: number;
  parseMs: number;
  version: string;
};

export type ParsedDoc = {
  id: string;
  name: string;
  ext: string;
  kind: FileKind;
  size: number;
  addedAt: number;
  status: ParseStatus;
  progress: number; // 0..100
  stage: string;
  stageDetail?: string;
  error?: string;
  text: string[];
  headings: number[]; // indices into `text` that are headings
  tables: ParsedTable[];
  pairs: KeyValue[];
  keywords?: string[];
  confidence?: number;
  source: "file" | "paste";
  meta?: DocMeta;
};
