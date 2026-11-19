import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { ParsedDoc } from "./types";
import { uid } from "./utils";
import { mockExtract } from "./mock";

export type Settings = {
  ocr: boolean;
  tables: boolean;
  layout: boolean;
  language: string;
  output: string;
};

export const [settings, setSettings] = createStore<Settings>({
  ocr: true,
  tables: true,
  layout: false,
  language: "Auto-detect",
  output: "Structured data",
});

export const [docs, setDocs] = createStore<{ list: ParsedDoc[] }>({ list: [] });

export const [activeTemplate, setActiveTemplate] = createSignal<string | null>(null);

export const findDoc = (id: string) => docs.list.find((d) => d.id === id);

export function removeDoc(id: string) {
  setDocs(
    "list",
    docs.list.filter((d) => d.id !== id)
  );
}

/* ------------------------------------------------------------------ */
/* Seed a few already-parsed documents so the workspace feels alive    */
/* ------------------------------------------------------------------ */

function seed(
  name: string,
  ext: string,
  kind: ParsedDoc["kind"],
  size: number,
  minutesAgo: number
): ParsedDoc {
  const r = mockExtract(name, kind);
  return {
    id: uid(),
    name,
    ext,
    kind,
    size,
    addedAt: Date.now() - minutesAgo * 60_000,
    status: "done",
    progress: 100,
    stage: "Complete",
    text: r.text,
    headings: r.headings,
    tables: r.tables,
    pairs: r.pairs,
    keywords: r.keywords,
    confidence: r.confidence,
    source: "file",
    meta: {
      pages: r.pages,
      words: r.words,
      chars: r.chars,
      language: r.language,
      ocrApplied: kind === "image" || kind === "pdf",
      tablesFound: r.tables.length,
      parseMs: 1200 + Math.floor(Math.random() * 1600),
      version: "Glyph 2.1.0",
    },
  };
}

export const seedDocs = () => {
  setDocs("list", [
    seed("Q3-business-review.pdf", "pdf", "pdf", 2_412_664, 52),
    seed("invoice-northwind-0847.pdf", "pdf", "pdf", 318_204, 187),
    seed("receipt-cafe-aurele.jpg", "jpg", "image", 1_140_992, 1_590),
    seed("team-retro-notes.md", "md", "text", 4_160, 2_960),
  ]);
};