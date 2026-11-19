import type { FileKind, ParsedTable, KeyValue } from "./types";

/* ------------------------------------------------------------------ */
/* Deterministic RNG so the same file always produces the same result  */
/* ------------------------------------------------------------------ */

function seedOf(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h || 42;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export type ExtractResult = {
  text: string[];
  headings: number[];
  tables: ParsedTable[];
  pairs: KeyValue[];
  pages: number;
  words: number;
  chars: number;
  confidence: number;
  language: string;
  keywords?: string[];
};

export function stagesFor(kind: FileKind | string, source: "file" | "paste"): string[] {
  if (source === "paste")
    return ["Analyzing content", "Extracting entities", "Building structure"];
  switch (kind) {
    case "pdf":
      return ["Uploading", "Extracting text layer", "Analyzing structure", "Detecting tables", "Resolving fields"];
    case "docx":
      return ["Uploading", "Unpacking document", "Reading paragraphs", "Mapping styles", "Extracting content"];
    case "image":
      return ["Uploading", "Preprocessing image", "Running OCR", "Reconstructing layout", "Extracting fields"];
    case "sheet":
      return ["Uploading", "Parsing workbook", "Inferring cell types", "Normalizing values"];
    case "text":
      return ["Reading file", "Analyzing content", "Extracting entities"];
    default:
      return ["Checking format"];
  }
}

/* ------------------------------------------------------------------ */
/* Mock extraction "results" — realistic parsed document content       */
/* ------------------------------------------------------------------ */

function invoiceMock(name: string): ExtractResult {
  const r = rng(seedOf(name));
  const vendors = ["Northwind Traders Ltd.", "Helios Systems Inc.", "Marlowe & Co.", "Bluepeak Analytics"];
  const vendor = vendors[Math.floor(r() * vendors.length)];
  const num = `INV-2025-${String(Math.floor(r() * 9000) + 1000)}`;
  const items: [string, number, number][] = [
    ["Consulting — data pipeline integration", Math.floor(r() * 20) + 8, 180],
    ["Parsing infrastructure — monthly usage", 1, Math.round(r() * 1200 + 900)],
    ["Premium support plan", 1, 490],
    ["Document conversion tooling", Math.floor(r() * 3) + 1, 610],
  ];
  const subtotal = items.reduce((s, [, q, u]) => s + q * u, 0);
  const tax = subtotal * 0.08;
  const rows = items.map(([d, q, u]) => [d, String(q), money(u), money(q * u)]);
  const text = [
    "INVOICE",
    vendor,
    `Invoice ${num}`,
    "Issued: October 28, 2025",
    "Due: November 27, 2025",
    "Bill to:",
    "Acme Corporation",
    "Attn: Accounts Payable",
    "475 Harbor Point Drive, Suite 210",
    "Boston, MA 02210",
    "Invoice items",
    "Payment terms: Net 30 · Wire or ACH accepted",
    `Subtotal: ${money(subtotal)}`,
    "Tax (8%): " + money(tax),
    `Total: ${money(subtotal + tax)}`,
    "Thank you for your business. Questions? billing@northwind.example",
  ];
  return {
    text,
    headings: [0, 5, 10],
    tables: [
      {
        caption: "Invoice line items",
        columns: ["Description", "Qty", "Unit price", "Amount"],
        rows,
      },
    ],
    pairs: [
      { key: "Vendor", value: vendor, confidence: 99 },
      { key: "Invoice number", value: num, confidence: 99 },
      { key: "Issue date", value: "2025-10-28", confidence: 98 },
      { key: "Due date", value: "2025-11-27", confidence: 98 },
      { key: "Subtotal", value: money(subtotal), confidence: 97 },
      { key: "Tax rate", value: "8%", confidence: 96 },
      { key: "Total", value: money(subtotal + tax), confidence: 99 },
      { key: "Payment terms", value: "Net 30", confidence: 95 },
      { key: "PO number", value: `PO-${Math.floor(r() * 90000) + 10000}`, confidence: 91 },
    ],
    pages: 1,
    words: 148,
    chars: 940,
    confidence: 98.1,
    language: "English",
  };
}

function reportMock(name: string): ExtractResult {
  const r = rng(seedOf(name));
  const rev = (12 + r() * 9).toFixed(1);
  const growth = Math.round(10 + r() * 14);
  const text = [
    "QUARTERLY BUSINESS REVIEW — Q3 2025",
    "Prepared by the Finance team · Confidential — internal use only",
    "Executive summary",
    `Revenue for the third quarter reached $${rev}M, up ${growth}% year over year and 6% ahead of plan. Growth was driven primarily by expansion within enterprise accounts, together with the general availability launch of the parsing API tier in August.`,
    "Operating highlights",
    "Document volume processed grew to 38M pages across all regions, with p95 parse latency improving from 2.4s to 1.1s.",
    "Gross margin improved 210 basis points following the OCR infrastructure migration to the new accelerator fleet.",
    "Net revenue retention held at 121% for the fourth consecutive quarter.",
    "Revenue by region",
    "Outlook",
    "We expect Q4 revenue between $19.4M and $20.1M, assuming seasonal volume in document processing and no material change in FX. Hiring continues in R&D; go-to-market spend will remain flat as we prioritize efficiency.",
  ];
  return {
    text,
    headings: [0, 2, 4, 8, 10],
    tables: [
      {
        caption: "Revenue by region",
        columns: ["Region", "Revenue", "Growth YoY", "Share"],
        rows: [
          ["North America", "$8.9M", "+14%", "49%"],
          ["EMEA", "$5.4M", "+21%", "30%"],
          ["APAC", "$2.9M", "+32%", "16%"],
          ["LATAM", "$1.0M", "+9%", "5%"],
          ["Total", "$18.2M", "+18%", "100%"],
        ],
      },
    ],
    pairs: [
      { key: "Document type", value: "Quarterly report", confidence: 98 },
      { key: "Period", value: "Q3 2025", confidence: 99 },
      { key: "Prepared by", value: "Finance team", confidence: 94 },
      { key: "Status", value: "Final — reviewed", confidence: 92 },
      { key: "Confidentiality", value: "Internal", confidence: 97 },
      { key: "Revenue (Q3)", value: "$18.2M", confidence: 98 },
    ],
    pages: 24,
    words: 2481,
    chars: 15902,
    confidence: 97.2,
    language: "English",
  };
}

function resumeMock(name: string): ExtractResult {
  const text = [
    "ALEX MORGAN",
    "Senior Product Engineer · Berlin, DE",
    "alex.morgan@example.com · +49 30 555 0182 · alexmorgan.dev",
    "Experience",
    "Glyph Labs — Senior Product Engineer (2022 — present)",
    "Led the parsing pipeline team of four engineers. Shipped layout-aware OCR that raised field-level accuracy from 92% to 99.4% on scanned invoices.",
    "Northbeam — Product Engineer (2019 — 2022)",
    "Built the document ingestion service handling 12M monthly uploads; cut storage cost 38% with tiered preprocessing.",
    "Skills",
    "TypeScript · SolidJS · Go · Python · Tesseract · Postgres · Redis · Kafka",
    "Education",
    "M.Sc. Computer Science — TU Munich, 2017",
    "Languages",
    "English (native) · German (C1) · Mandarin (B1)",
  ];
  return {
    text,
    headings: [0, 3, 6, 9, 11],
    tables: [],
    pairs: [
      { key: "Full name", value: "Alex Morgan", confidence: 99 },
      { key: "Email", value: "alex.morgan@example.com", confidence: 99 },
      { key: "Phone", value: "+49 30 555 0182", confidence: 97 },
      { key: "Current role", value: "Senior Product Engineer", confidence: 96 },
      { key: "Location", value: "Berlin, DE", confidence: 95 },
      { key: "Years of experience", value: "7", confidence: 88 },
    ],
    pages: 2,
    words: 214,
    chars: 1422,
    confidence: 96.4,
    language: "English",
  };
}

function receiptMock(name: string): ExtractResult {
  const r = rng(seedOf(name));
  const total = (r() * 40 + 9).toFixed(2);
  const text = [
    "RECEIPT",
    "Café Auréle — Prenzlauer Allee 42, Berlin",
    "Oct 12, 2025 · 09:41 · Terminal 2 · Order #A-2214",
    "Items",
    "Paid with Visa •• 4242",
    `Total: €${total} — incl. 7% VAT`,
    "Thank you for stopping by!",
  ];
  return {
    text,
    headings: [0, 3],
    tables: [
      {
        caption: "Items",
        columns: ["Item", "Qty", "Price"],
        rows: [
          ["Flat white", "1", "€4.20"],
          ["Butter croissant", "2", "€3.10"],
          ["Sparkling water 0.5l", "1", "€2.40"],
        ],
      },
    ],
    pairs: [
      { key: "Merchant", value: "Café Auréle", confidence: 98 },
      { key: "Date", value: "2025-10-12", confidence: 97 },
      { key: "Time", value: "09:41", confidence: 96 },
      { key: "Total", value: `€${total}`, confidence: 99 },
      { key: "Payment method", value: "Visa •• 4242", confidence: 95 },
      { key: "VAT", value: "7%", confidence: 90 },
    ],
    pages: 1,
    words: 62,
    chars: 410,
    confidence: 93.7,
    language: "English · German mix",
  };
}

function scanMock(name: string): ExtractResult {
  const r = rng(seedOf(name));
  const org = ["Acme Corporation", "Meridian Institute", "Beacon University"][Math.floor(r() * 3)];
  const text = [
    "SCANNED DOCUMENT",
    `${org} — Records Office`,
    "Reference: DOC-2025-0447 · Received: October 12, 2025",
    "Summary of contents",
    "This scanned document contains the original request form, a signed authorization page and two supporting attachments. All pages were legible; one stamp partially obscures the footer on page 2.",
    "Key details",
    "Request type: Records amendment",
    "Received by: J. Whitfield",
    "Authorization: Signed — October 12, 2025",
    "Attachments: 2",
  ];
  return {
    text,
    headings: [0, 4, 6],
    tables: [],
    pairs: [
      { key: "Organization", value: org, confidence: 96 },
      { key: "Reference", value: "DOC-2025-0447", confidence: 98 },
      { key: "Received", value: "2025-10-12", confidence: 95 },
      { key: "Received by", value: "J. Whitfield", confidence: 93 },
      { key: "Attachments", value: "2", confidence: 91 },
    ],
    pages: 4,
    words: 178,
    chars: 1180,
    confidence: 91.8,
    language: "English",
  };
}

function sheetMock(name: string): ExtractResult {
  const r = rng(seedOf(name));
  const rows: string[][] = [];
  const cats = ["Software", "Travel", "Office", "Marketing", "Hardware"];
  let t = 0;
  for (let i = 0; i < 6; i++) {
    const amt = Math.round(r() * 900 + 60);
    t += amt;
    rows.push([
      `2025-10-${String(2 + i * 4).padStart(2, "0")}`,
      ["Figma seats", "Client offsite", "Standing desks", "Conference booth", "Monitors ×4", "Ads — search"][i],
      cats[Math.floor(r() * cats.length)],
      `$${amt.toLocaleString()}.00`,
    ]);
  }
  rows.push(["Total", "", "", `$${t.toLocaleString()}.00`]);
  const text = [
    "WORKBOOK — EXPENSES 2025",
    "Sheets: Transactions · Budget · Summary",
    "Active range: A1:F84 · 6 normalized columns",
    "Transactions",
  ];
  return {
    text,
    headings: [0, 3],
    tables: [
      {
        caption: "Sheet — Transactions (normalized)",
        columns: ["Date", "Description", "Category", "Amount"],
        rows,
      },
    ],
    pairs: [
      { key: "Workbook", value: name, confidence: 99 },
      { key: "Sheets", value: "3", confidence: 98 },
      { key: "Active sheet", value: "Transactions", confidence: 97 },
      { key: "Rows parsed", value: "84", confidence: 96 },
      { key: "Total (transactions)", value: `$${t.toLocaleString()}.00`, confidence: 95 },
    ],
    pages: 3,
    words: 310,
    chars: 2050,
    confidence: 99.2,
    language: "English",
  };
}

function notesMock(name: string): ExtractResult {
  const text = [
    "Engineering retro — Sprint 42",
    "Attendees: Priya, Jonas, Marek, Sofie · Oct 10, 2025",
    "What went well",
    "Parser rewrite cut p95 latency from 2.4s to 1.1s across the board.",
    "Zero incidents during deploy week — the new canary process held up.",
    "What to improve",
    "OCR queue can starve large uploads; consider fair scheduling.",
    "Docs for the fields endpoint are stale after the v2 migration.",
    "Actions",
    "Priya: draft the fair-scheduling RFC by Thursday.",
    "Jonas: audit metrics dashboards and archive unused panels.",
    "Marek: update fields-endpoint docs before Sprint 43 planning.",
  ];
  return {
    text,
    headings: [0, 2, 5, 8],
    tables: [],
    pairs: [
      { key: "Meeting type", value: "Sprint retro", confidence: 97 },
      { key: "Sprint", value: "42", confidence: 98 },
      { key: "Attendees", value: "4", confidence: 96 },
      { key: "Date", value: "2025-10-10", confidence: 94 },
    ],
    pages: 2,
    words: 126,
    chars: 812,
    confidence: 100,
    language: "English",
  };
}

function genericMock(name: string): ExtractResult {
  const r = rng(seedOf(name));
  const stem = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  const title = stem.replace(/\b\w/g, (c) => c.toUpperCase()) || "Untitled document";
  const org = ["Acme Corporation", "Meridian Institute", "Beacon University", "Northwind Traders"][Math.floor(r() * 4)];
  const pages = 6 + Math.floor(r() * 16);
  const text = [
    title,
    `${org} · Version 2.3 · Effective October 2025`,
    "Overview",
    "The following sets out the key terms and findings extracted from the source document. Section headings, numeric fields and tabular data were reconstructed automatically by the parsing engine and are presented below in reading order.",
    "Key terms",
    "Signatures",
    "Signed — A. Morgan · October 12, 2025",
    "Countersigned — R. Okafor · October 14, 2025",
  ];
  return {
    text,
    headings: [0, 3, 5, 7],
    tables: [
      {
        caption: "Key terms",
        columns: ["Field", "Value"],
        rows: [
          ["Parties", `${org} and affiliates`],
          ["Effective date", "2025-10-01"],
          ["Term", "24 months, auto-renewing"],
          ["Governing law", "Delaware, United States"],
          ["Notice period", "60 days"],
        ],
      },
    ],
    pairs: [
      { key: "Document title", value: title, confidence: 97 },
      { key: "Organization", value: org, confidence: 95 },
      { key: "Version", value: "2.3", confidence: 92 },
      { key: "Effective date", value: "2025-10-01", confidence: 96 },
      { key: "Pages", value: String(pages), confidence: 99 },
    ],
    pages,
    words: 480 + Math.floor(r() * 900),
    chars: 3200 + Math.floor(r() * 4000),
    confidence: 94 + r() * 4,
    language: "English",
  };
}

/** Fake-but-realistic extraction for binary formats we don't actually decode in the demo. */
export function mockExtract(name: string, kind: FileKind): ExtractResult {
  const n = name.toLowerCase();
  const r = rng(seedOf(name));
  let res: ExtractResult;
  if (kind === "sheet") res = sheetMock(name);
  else if (kind === "image") res = n.includes("receipt") ? receiptMock(name) : scanMock(name);
  else if (kind === "text") res = notesMock(name);
  else if (n.includes("resume") || n.includes("cv")) res = resumeMock(name);
  else if (n.includes("invoice")) res = invoiceMock(name);
  else if (n.includes("report") || n.includes("review") || n.includes("quarter") || n.includes("q3"))
    res = reportMock(name);
  else res = genericMock(name);
  // tiny per-parse jitter so retries feel alive (deterministic per name)
  res.confidence = Math.round(res.confidence * 10) / 10;
  void r;
  return res;
}

/* ------------------------------------------------------------------ */
/* Real analysis for text-like content (txt, md, csv, pasted text)     */
/* ------------------------------------------------------------------ */

function uniq(xs: string[] | null) {
  return [...new Set((xs ?? []).map((s) => s.trim()))].filter(Boolean);
}

const STOP = new Set(
  "the a an and or of to in for with on is are was were be been this that these those it its from as at by we you they he she not but if then than our your their have has had will would can could should about into over under more most other such only also may might must shall when where what who whom which while because so very just don now new like get got make made use used using".split(
    " "
  )
);

function topKeywords(text: string) {
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? []) {
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

const MD_HEAD = /^(#{1,6})\s+(.*)$/;

export function analyzeText(raw: string): ExtractResult {
  const clean = raw.replace(/\r\n?/g, "\n");
  const lines = clean.split("\n");
  const text: string[] = [];
  const headings: number[] = [];
  let buf = "";
  const flush = () => {
    if (buf.trim()) {
      text.push(buf.trim());
      buf = "";
    }
  };
  for (const l of lines) {
    const m = MD_HEAD.exec(l.trim());
    if (m) {
      flush();
      headings.push(text.length);
      text.push(m[2]);
      continue;
    }
    const t = l.trim();
    if (!t) {
      flush();
      continue;
    }
    if (
      t.length <= 60 &&
      !/[.,;:!?]$/.test(t) &&
      (t === t.toUpperCase() || /^[A-Z][A-Za-z0-9 ,&/–—'"().-]*$/.test(t))
    ) {
      flush();
      headings.push(text.length);
      text.push(t);
      continue;
    }
    buf = buf ? buf + " " + t : t;
  }
  flush();

  const chars = clean.length;
  const words = clean.trim() ? clean.trim().split(/\s+/).length : 0;
  const pairs: KeyValue[] = [];
  uniq(clean.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/g)).slice(0, 3).forEach((e) => pairs.push({ key: "Email", value: e, confidence: 99 }));
  uniq(clean.match(/https?:\/\/[^\s)"']+/g)).slice(0, 2).forEach((u) => pairs.push({ key: "URL", value: u, confidence: 97 }));
  uniq(clean.match(/[$€£]\s?\d[\d,]*(?:\.\d{2})?/g)).slice(0, 4).forEach((v) => pairs.push({ key: "Amount", value: v, confidence: 96 }));
  uniq(clean.match(/\b\d{4}-\d{2}-\d{2}\b/g)).slice(0, 3).forEach((v) => pairs.push({ key: "Date", value: v, confidence: 94 }));
  uniq(clean.match(/\b\d+(?:\.\d+)?%\b/g)).slice(0, 3).forEach((v) => pairs.push({ key: "Percentage", value: v, confidence: 93 }));

  return {
    text,
    headings,
    tables: [],
    pairs,
    pages: Math.max(1, Math.ceil(words / 350)),
    words,
    chars,
    confidence: 100,
    language: "English (detected)",
    keywords: topKeywords(clean),
  };
}

/** Lightweight entity scan over already-parsed text, for the Data tab. */
export function extractEntities(text: string) {
  const out: { label: string; value: string }[] = [];
  const push = (label: string, xs: string[] | null, max = 3) =>
    uniq(xs).slice(0, max).forEach((value) => out.push({ label, value }));
  push("Email", text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/g));
  push("URL", text.match(/https?:\/\/[^\s)"']+/g), 2);
  push("Amount", text.match(/[$€£]\s?\d[\d,]*(?:\.\d{2})?/g), 4);
  push("Date", text.match(/\b\d{4}-\d{2}-\d{2}\b/g), 3);
  push("Percentage", text.match(/\b\d+(?:\.\d+)?%/g), 3);
  return out;
}
