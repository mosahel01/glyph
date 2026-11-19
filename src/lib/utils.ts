import type { FileKind, ParsedDoc, ParsedTable } from "./types";

export const cls = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export const extOf = (name: string) => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
};

export function kindOf(name: string): FileKind {
  const e = extOf(name);
  if (e === "pdf") return "pdf";
  if (["docx", "doc", "rtf", "odt", "epub", "pages"].includes(e)) return "docx";
  if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "heic"].includes(e)) return "image";
  if (["csv", "xlsx", "xls", "tsv"].includes(e)) return "sheet";
  if (["txt", "md", "markdown", "json", "xml", "yaml", "yml", "log", "html"].includes(e))
    return "text";
  return "other";
}

export const kindLabel: Record<FileKind, string> = {
  pdf: "PDF",
  docx: "Document",
  image: "Image · OCR",
  sheet: "Spreadsheet",
  text: "Plain text",
  other: "Unknown",
};

export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const clockTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const nf = new Intl.NumberFormat("en-US");
export const fmtNum = (n: number) => nf.format(n);

export function download(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/* ---------- exporters ---------- */

export function toMarkdown(d: ParsedDoc): string {
  let md = `# ${d.name.replace(/\.[^.]+$/, "")}\n\n`;
  d.text.forEach((line, i) => {
    if (d.headings.includes(i)) md += `\n## ${line}\n\n`;
    else md += `${line}\n\n`;
  });
  d.tables.forEach((t, i) => {
    md += `### Table ${i + 1}${t.caption ? ` — ${t.caption}` : ""}\n\n`;
    md += `| ${t.columns.join(" | ")} |\n`;
    md += `| ${t.columns.map(() => "---").join(" | ")} |\n`;
    t.rows.forEach((r) => (md += `| ${r.join(" | ")} |\n`));
    md += "\n";
  });
  if (d.pairs.length) {
    md += `## Extracted fields\n\n`;
    d.pairs.forEach((p) => (md += `- **${p.key}:** ${p.value} _(${p.confidence}%)_\n`));
    md += "\n";
  }
  if (d.meta) {
    md += `---\n*Parsed with Glyph 2.1.0 · ${d.meta.pages} pages · ${d.meta.words.toLocaleString()} words · confidence ${Math.round(
      d.confidence ?? 0
    )}%*\n`;
  }
  return md;
}

export function toJSON(d: ParsedDoc): string {
  return JSON.stringify(
    {
      name: d.name,
      kind: d.kind,
      size: d.size,
      extractedAt: new Date(d.addedAt).toISOString(),
      confidence: d.confidence ?? null,
      meta: d.meta ?? null,
      fields: d.pairs.map((p) => ({ field: p.key, value: p.value, confidence: p.confidence })),
      content: d.text,
      tables: d.tables,
    },
    null,
    2
  );
}

export function tableToCSV(t: ParsedTable): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [t.columns, ...t.rows].map((r) => r.map(esc).join(",")).join("\n");
}
