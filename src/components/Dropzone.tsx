import { For, Show, createSignal } from "solid-js";
import { CloudUpload, ClipboardPaste, FileDown, Globe, LayoutTemplate, Plus, ScanText, Sparkles, Table2, X } from "lucide-solid";
import { addFiles, addPaste } from "../lib/parser";
import { activeTemplate, setActiveTemplate, settings, setSettings } from "../lib/store";
import { cls, kindLabel } from "../lib/utils";
import type { FileKind } from "../lib/types";
import { Toggle, toast } from "./ui";

const ACCEPT = ".pdf,.docx,.doc,.rtf,.odt,.txt,.md,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.json,.html";
const FORMAT_CHIPS: { label: string; kind: FileKind }[] = [
  { label: "PDF", kind: "pdf" },
  { label: "DOCX", kind: "docx" },
  { label: "XLSX · CSV", kind: "sheet" },
  { label: "PNG · JPG", kind: "image" },
  { label: "TXT · MD", kind: "text" },
];

export function Dropzone() {
  const [dragging, setDragging] = createSignal(false);
  const [pasting, setPasting] = createSignal(false);
  const [text, setText] = createSignal("");
  let depth = 0;

  const openPicker = () => (document.getElementById("glyph-file-input") as HTMLInputElement)?.click();

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth = 0;
    setDragging(false);
    if (e.dataTransfer?.files.length) {
      addFiles(e.dataTransfer.files);
      toast(`Queued ${e.dataTransfer.files.length} file${e.dataTransfer.files.length > 1 ? "s" : ""} for parsing`, "info");
    }
  };

  return (
    <div class="space-y-5">
      {/* template banner */}
      <Show when={activeTemplate()}>
        <div class="animate-pop flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm dark:border-violet-500/25 dark:bg-violet-500/10">
          <LayoutTemplate class="h-4.5 w-4.5 text-violet-600 dark:text-violet-300" style={{ height: "18px", width: "18px" }} />
          <span class="flex-1">
            <span class="font-semibold text-violet-700 dark:text-violet-200">{activeTemplate()}</span>
            <span class="text-violet-600/80 dark:text-violet-300/70"> template active — fields will be mapped automatically.</span>
          </span>
          <button class="rounded-lg p-1.5 text-violet-500 transition hover:bg-violet-100 dark:hover:bg-violet-500/15" onClick={() => setActiveTemplate(null)} aria-label="Clear template">
            <X class="h-4 w-4" />
          </button>
        </div>
      </Show>

      <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* dropzone + paste */}
        <div class="space-y-4">
          <div
            class={cls(
              "relative grid place-items-center overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 sm:p-14",
              dragging()
                ? "scale-[1.01] border-violet-500 bg-violet-50/60 dark:border-violet-400 dark:bg-violet-500/[0.08]"
                : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-white/20"
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              depth++;
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {
              depth = Math.max(0, depth - 1);
              if (depth === 0) setDragging(false);
            }}
            onDrop={onDrop}
          >
            <div class="pointer-events-none absolute inset-0 dots text-zinc-300/60 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:text-zinc-600/25" />
            <input
              id="glyph-file-input"
              type="file"
              multiple
              accept={ACCEPT}
              class="hidden"
              onChange={(e) => {
                if (e.currentTarget.files?.length) {
                  addFiles(e.currentTarget.files);
                  toast(`Queued ${e.currentTarget.files.length} file${e.currentTarget.files.length > 1 ? "s" : ""} for parsing`, "info");
                }
                e.currentTarget.value = "";
              }}
            />

            <div class="relative">
              <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30 transition-transform duration-200" classList={{ "scale-110": dragging() }}>
                <CloudUpload class="h-7 w-7" style={{ height: "28px", width: "28px" }} />
              </div>
              <h3 class="mt-4 text-lg font-bold tracking-tight">
                {dragging() ? "Drop to start parsing" : "Drag & drop documents here"}
              </h3>
              <p class="mx-auto mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                PDFs, Word docs, spreadsheets, images and more. Files are parsed in your workspace — nothing leaves it.
              </p>

              <div class="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button class="btn-primary" onClick={openPicker}>
                  <Plus class="h-4 w-4" />
                  Browse files
                </button>
                <button class="btn-ghost" onClick={() => setPasting((v) => !v)}>
                  <ClipboardPaste class="h-4 w-4" />
                  Paste text
                </button>
              </div>

              <div class="mt-6 flex flex-wrap items-center justify-center gap-1.5">
                <For each={FORMAT_CHIPS}>
                  {(f) => <span class="chip !py-0.5 text-[11px]">{f.label}</span>}
                </For>
                <span class="text-[11px] text-zinc-400 dark:text-zinc-500">· up to 50 MB each</span>
              </div>
            </div>
          </div>

          {/* paste mode */}
          <Show when={pasting()}>
            <div class="animate-pop card p-4">
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardPaste class="h-4 w-4 text-violet-500" />
                  Paste raw text
                </div>
                <span class="text-xs text-zinc-400 dark:text-zinc-500">{text().length.toLocaleString()} chars</span>
              </div>
              <textarea
                class="field h-40 resize-y font-mono !text-[13px] leading-relaxed"
                placeholder={"Paste any text — an email, meeting notes, an article…\n\nGlyph will detect headings, entities, dates and amounts automatically."}
                value={text()}
                onInput={(e) => setText(e.currentTarget.value)}
              />
              <div class="mt-3 flex items-center justify-end gap-2">
                <button class="btn-ghost !px-3.5 !py-2 !text-[13px]" onClick={() => { setText(""); setPasting(false); }}>
                  Cancel
                </button>
                <button
                  class="btn-primary !px-3.5 !py-2 !text-[13px]"
                  disabled={!text().trim()}
                  classList={{ "opacity-50 pointer-events-none": !text().trim() }}
                  onClick={() => {
                    addPaste(text());
                    setText("");
                    setPasting(false);
                    toast("Text queued for analysis", "info");
                  }}
                >
                  <Sparkles class="h-4 w-4" />
                  Parse text
                </button>
              </div>
            </div>
          </Show>

          <OptionsPanel />
        </div>

        {/* side cards */}
        <div class="space-y-4">
          <div class="card p-4">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <FileDown class="h-4 w-4 text-violet-500" />
              Output format
            </div>
            <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Applied when you copy or export results.</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <For each={["Structured", "Markdown", "JSON", "Plain text"]}>
                {(o) => (
                  <button
                    onClick={() => setSettings("output", o)}
                    class={cls(
                      "rounded-lg border px-2.5 py-2 text-xs font-semibold transition",
                      settings.output === o
                        ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/20"
                    )}
                  >
                    {o}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="card p-4">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <Globe class="h-4 w-4 text-violet-500" />
              Language
            </div>
            <select class="field mt-3 appearance-none" value={settings.language} onChange={(e) => setSettings("language", e.currentTarget.value)}>
              <For each={["Auto-detect", "English", "German", "French", "Spanish", "Japanese", "Portuguese"]}>
                {(l) => <option value={l}>{l}</option>}
              </For>
            </select>
            <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">OCR recognizes 30+ languages with automatic script detection.</p>
          </div>

          <div class="card border-dashed p-4 dark:border-white/10">
            <div class="text-sm font-semibold">Pro tips</div>
            <ul class="mt-2 space-y-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              <li class="flex gap-2"><span class="text-violet-500">→</span>Name files with “invoice” to auto-map the invoice template.</li>
              <li class="flex gap-2"><span class="text-violet-500">→</span>Plain text and Markdown are parsed locally, instantly and for free.</li>
              <li class="flex gap-2"><span class="text-violet-500">→</span>Unsupported formats surface a clear error — nothing crashes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionsPanel() {
  return (
    <div class="card p-4 sm:p-5">
      <div class="flex items-center gap-2">
        <ScanText class="h-4 w-4 text-violet-500" />
        <span class="text-sm font-semibold">Parsing options</span>
      </div>
      <div class="mt-2 divide-y divide-zinc-100 dark:divide-white/[0.06]">
        <Toggle
          label="Layout-aware OCR"
          desc="Reconstructs reading order on scans"
          checked={settings.ocr}
          onChange={(v) => setSettings("ocr", v)}
        />
        <div class="pt-1">
          <Toggle
            label="Table detection"
            desc="Find and rebuild tables as grids"
            checked={settings.tables}
            onChange={(v) => setSettings("tables", v)}
          />
        </div>
        <div class="pt-1">
          <Toggle
            label="Preserve original layout"
            desc="Keep pagination and columns intact"
            checked={settings.layout}
            onChange={(v) => setSettings("layout", v)}
          />
        </div>
      </div>
      <div class="mt-3 flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
        <Table2 class="h-3.5 w-3.5 shrink-0 text-violet-400" />
        Changes apply to newly added files only.
      </div>
    </div>
  );
}
