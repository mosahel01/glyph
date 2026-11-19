import { produce } from "solid-js/store";
import { docs, setDocs, settings } from "./store";
import type { ParsedDoc, DocMeta } from "./types";
import { sleep, uid, extOf, kindOf } from "./utils";
import { stagesFor, mockExtract, analyzeText, type ExtractResult } from "./mock";

/* File handles live outside the store (proxies would break Blob APIs) */
const files = new Map<string, File>();
const pastes = new Map<string, string>();
const canceled = new Set<string>();

export const cancelParse = (id: string) => canceled.add(id);

const idx = (id: string) => docs.list.findIndex((d) => d.id === id);

function patch(id: string, fn: (d: ParsedDoc) => void) {
  const i = idx(id);
  if (i >= 0) setDocs("list", i, produce(fn));
}

function detailFor(stage: string, page: number, pages: number, kind: string): string | undefined {
  if (/upload/i.test(stage))
    return kind === "image" ? `${pages} image${pages > 1 ? "s" : ""}` : `${pages} pages`;
  if (/table/i.test(stage)) return page >= pages ? `${pages} pages · final pass` : `Page ${page} of ${pages}`;
  if (/ocr|text layer|paragraph|workbook|image|content|analyz|structure|layout|field|style|normal/i.test(stage))
    return `Page ${page} of ${pages}`;
  return undefined;
}

export function addFiles(list: FileList | File[]) {
  const arr = Array.from(list).slice(0, 10);
  const ids: string[] = [];
  for (const f of arr) {
    const id = uid();
    files.set(id, f);
    const doc: ParsedDoc = {
      id,
      name: f.name,
      ext: extOf(f.name),
      kind: kindOf(f.name),
      size: f.size,
      addedAt: Date.now(),
      status: "queued",
      progress: 0,
      stage: "Queued",
      text: [],
      headings: [],
      tables: [],
      pairs: [],
      source: "file",
    };
    setDocs("list", (v) => [...v, doc]);
    ids.push(id);
  }
  ids.forEach((id) => void runParse(id));
  return ids;
}

export function addPaste(text: string) {
  const id = uid();
  pastes.set(id, text);
  const doc: ParsedDoc = {
    id,
    name: "Pasted text",
    ext: "txt",
    kind: "text",
    size: new TextEncoder().encode(text).length,
    addedAt: Date.now(),
    status: "queued",
    progress: 0,
    stage: "Queued",
    text: [],
    headings: [],
    tables: [],
    pairs: [],
    source: "paste",
  };
  setDocs("list", (v) => [...v, doc]);
  void runParse(id);
  return id;
}

export function retry(id: string) {
  const d = docs.list[idx(id)];
  if (!d) return;
  canceled.delete(id);
  patch(id, (x) => {
    x.status = "queued";
    x.progress = 0;
    x.stage = "Queued";
    x.stageDetail = undefined;
    x.error = undefined;
  });
  void runParse(id);
}

function finishCancel(id: string) {
  patch(id, (d) => {
    d.status = "canceled";
    d.stage = "Canceled";
  });
}

async function runParse(id: string) {
  const i = idx(id);
  if (i < 0) return;
  const doc = docs.list[i];
  const file = files.get(id);
  const t0 = Date.now();

  if (doc.kind === "other" || (file && file.size === 0)) {
    await sleep(650);
    patch(id, (d) => {
      d.status = "error";
      d.stage = "Unsupported";
      d.error =
        doc.kind === "other"
          ? `Unsupported format “.${doc.ext || "?"}” — try PDF, DOCX, XLSX, CSV, PNG, JPG or TXT.`
          : "File is empty.";
    });
    return;
  }

  canceled.delete(id);
  const stages = stagesFor(doc.kind, doc.source);
  patch(id, (d) => {
    d.status = "parsing";
  });

  const pages =
    doc.kind === "pdf"
      ? 6 + Math.floor(Math.random() * 22)
      : doc.kind === "docx"
        ? 4 + Math.floor(Math.random() * 14)
        : doc.kind === "image"
          ? 1 + Math.floor(Math.random() * 2)
          : doc.kind === "sheet"
            ? 1
            : Math.max(1, Math.round((doc.size || 2000) / 1200));

  const quick = doc.kind === "text" || doc.source === "paste";
  const steps = quick ? 4 : 7;

  for (let s = 0; s < stages.length; s++) {
    if (canceled.has(id)) return finishCancel(id);
    patch(id, (d) => {
      d.stage = stages[s];
    });
    for (let k = 0; k <= steps; k++) {
      if (canceled.has(id)) return finishCancel(id);
      const done = (s + k / steps) / stages.length;
      const page = Math.min(pages, Math.round(done * pages));
      patch(id, (d) => {
        d.progress = Math.min(96, Math.round(done * 100));
        const label = detailFor(stages[s], page, pages, doc.kind);
        if (label) d.stageDetail = label;
      });
      await sleep((quick ? 24 : 32) + Math.random() * (quick ? 30 : 60));
    }
  }

  if (canceled.has(id)) return finishCancel(id);

  let result: ExtractResult;
  if (doc.source === "paste") result = analyzeText(pastes.get(id) ?? "");
  else if (doc.kind === "text") result = file ? analyzeText(await file.text()) : mockExtract(doc.name, doc.kind);
  else result = mockExtract(doc.name, doc.kind);

  const meta: DocMeta = {
    pages,
    words: result.words,
    chars: result.chars,
    language: result.language,
    ocrApplied:
      doc.kind === "image" ||
      ((doc.kind === "pdf" || doc.kind === "docx") && settings.ocr && Math.random() < 0.35),
    tablesFound: settings.tables ? result.tables.length : 0,
    parseMs: Date.now() - t0,
    version: "Glyph 2.1.0",
  };

  patch(id, (d) => {
    d.status = "done";
    d.progress = 100;
    d.stage = "Complete";
    d.text = result.text;
    d.headings = result.headings;
    d.tables = settings.tables ? result.tables : [];
    d.pairs = result.pairs;
    d.keywords = result.keywords;
    d.confidence = result.confidence;
    d.meta = meta;
  });
}
