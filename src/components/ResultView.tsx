import { For, Show, createMemo, createSignal } from "solid-js";
import { ArrowLeft, Braces, Check, Copy, Download, FileText, Search, Table2, ScanText, Info } from "lucide-solid";
import type { ParsedDoc } from "../lib/types";
import { extractEntities } from "../lib/mock";
import { cls, clockTime, copyText, download, formatBytes, kindLabel, tableToCSV, timeAgo, toMarkdown, toJSON } from "../lib/utils";
import { KindIcon, Ring, StatusChip, toast } from "./ui";

type Tab = "text" | "tables" | "data" | "meta";

export function ResultView(props: { doc: ParsedDoc; onBack: () => void }) {
  const d = () => props.doc;
  const [tab, setTab] = createSignal<Tab>("text");
  const [query, setQuery] = createSignal("");

  const lines = createMemo(() => d().text.map((line, i) => ({ line, head: d().headings.includes(i) })));
  const filtered = createMemo(() => {
    const q = query().trim().toLowerCase();
    return q ? lines().filter((l) => l.line.toLowerCase().includes(q)) : lines();
  });
  const entities = createMemo(() => extractEntities(d().text.join("\n")));
  const fileName = () => d().name.replace(/\.[^.]+$/, "");

  const doCopy = async (what: "text" | "json" | "table", t?: string) => {
    let payload = "";
    if (what === "text") payload = d().text.join("\n");
    else if (what === "json") payload = toJSON(d());
    else payload = t ?? "";
    await copyText(payload);
    toast("Copied to clipboard");
  };

  const doDownload = (fmt: "md" | "json" | "txt") => {
    const content = fmt === "md" ? toMarkdown(d()) : fmt === "json" ? toJSON(d()) : d().text.join("\n");
    download(`${fileName()}.${fmt}`, content, fmt === "json" ? "application/json" : "text/markdown");
    toast(`Downloaded ${fileName()}.${fmt}`);
  };

  const tabs: { id: Tab; label: string; icon: typeof FileText; count?: () => number }[] = [
    { id: "text", label: "Text", icon: FileText, count: () => d().text.length },
    { id: "tables", label: "Tables", icon: Table2, count: () => d().tables.length },
    { id: "data", label: "Data", icon: Braces, count: () => d().pairs.length },
    { id: "meta", label: "Metadata", icon: Info },
  ];

  return (
    <div class="animate-fade-up space-y-5">
      {/* header */}
      <div class="card p-4 sm:p-5">
        <div class="flex flex-wrap items-center gap-4">
          <button class="btn-icon -ml-2 shrink-0" onClick={props.onBack} aria-label="Back">
            <ArrowLeft class="h-[18px] w-[18px]" />
          </button>
          <KindIcon kind={d().kind} class="!h-12 !w-12" iconClass="!h-6 !w-6" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2.5">
              <h2 class="truncate text-lg font-bold tracking-tight">{d().name}</h2>
              <StatusChip status={d().status} />
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{kindLabel[d().kind]}</span>
              <span>·</span>
              <span>{formatBytes(d().size)}</span>
              <span>·</span>
              <span>Added {timeAgo(d().addedAt)}</span>
              <Show when={d().meta}>
                <span>·</span>
                <span>
                  {d().meta!.pages} page{d().meta!.pages > 1 ? "s" : ""} · {d().meta!.words.toLocaleString()} words
                </span>
              </Show>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden text-right sm:block">
              <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Confidence</div>
              <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{Math.round(d().confidence ?? 0)}%</div>
            </div>
            <Ring value={d().confidence ?? 0} />
          </div>

          <div class="flex w-full flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-white/[0.06] sm:w-auto sm:border-0 sm:pt-0">
            <button class="btn-ghost !px-3 !py-2 !text-xs" onClick={() => doCopy("text")}>
              <Copy class="h-3.5 w-3.5" /> Copy text
            </button>
            <button class="btn-ghost !px-3 !py-2 !text-xs" onClick={() => doDownload("md")}>
              <Download class="h-3.5 w-3.5" /> .md
            </button>
            <button class="btn-ghost !px-3 !py-2 !text-xs" onClick={() => doDownload("json")}>
              <Braces class="h-3.5 w-3.5" /> .json
            </button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div class="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 dark:border-white/[0.06]">
        <For each={tabs}>
          {(t) => {
            const active = () => tab() === t.id;
            return (
              <button
                onClick={() => setTab(t.id)}
                class={cls(
                  "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition",
                  active()
                    ? "border-violet-500 text-violet-700 dark:text-violet-300"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                <t.icon class="h-4 w-4" />
                {t.label}
                <Show when={t.count}>
                  <span class="chip !px-1.5 !py-0 text-[10px]">{t.count!()}</span>
                </Show>
              </button>
            );
          }}
        </For>
        <div class="ml-auto hidden items-center gap-2 pb-2 pr-1 text-xs text-zinc-400 dark:text-zinc-500 sm:flex">
          <Check class="h-3.5 w-3.5 text-emerald-500" />
          Parsed {clockTime(d().addedAt)} · {((d().meta?.parseMs ?? 1400) / 1000).toFixed(1)}s
        </div>
      </div>

      {/* panels */}
      <Show when={tab() === "text"}>
        <div class="card overflow-hidden">
          <div class="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 dark:border-white/[0.06]">
            <div class="flex flex-1 items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-sm dark:bg-white/[0.04] sm:max-w-xs">
              <Search class="h-3.5 w-3.5 text-zinc-400" />
              <input
                class="w-full bg-transparent text-[13px] outline-none placeholder:text-zinc-400"
                placeholder="Search in text…"
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
              />
            </div>
            <span class="text-xs text-zinc-400 dark:text-zinc-500">
              {filtered().length} of {d().text.length} blocks
            </span>
          </div>
          <div class="max-h-[560px] overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-[1.8]">
            <Show
              when={filtered().length > 0}
              fallback={
                <div class="py-14 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  <ScanText class="mx-auto mb-3 h-8 w-8 opacity-40" />
                  No textual content extracted — try enabling OCR for scanned documents.
                </div>
              }
            >
              <For each={filtered()}>
                {(item) => (
                  <div
                    class={cls(
                      "border-l-2 py-0.5 pl-3",
                      item.head
                        ? "mt-3 border-violet-500/70 font-semibold text-zinc-900 first:mt-0 dark:text-zinc-50"
                        : "border-transparent text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {item.line}
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </Show>

      <Show when={tab() === "tables"}>
        <div class="space-y-4">
          <Show
            when={d().tables.length > 0}
            fallback={
              <div class="card grid place-items-center px-4 py-16 text-center text-sm text-zinc-400 dark:text-zinc-500">
                <div>
                  <Table2 class="mx-auto mb-3 h-8 w-8 opacity-40" />
                  No tables were detected in this document.
                </div>
              </div>
            }
          >
            <For each={d().tables}>
              {(t, i) => (
                <div class="card overflow-hidden">
                  <div class="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06]">
                    <span class="text-sm font-semibold">
                      Table {i() + 1}
                      {t.caption ? ` — ${t.caption}` : ""}
                    </span>
                    <span class="chip !py-0 text-[10px]">
                      {t.rows.length} rows × {t.columns.length} cols
                    </span>
                    <span class="ml-auto text-[11px] text-emerald-600 dark:text-emerald-400">● grid reconstructed</span>
                    <button class="btn-ghost !px-2.5 !py-1.5 !text-xs" onClick={() => doCopy("table", tableToCSV(t))}>
                      <Copy class="h-3.5 w-3.5" /> CSV
                    </button>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[480px] text-left text-sm">
                      <thead>
                        <tr class="border-b border-zinc-200 dark:border-white/[0.08]">
                          <For each={t.columns}>
                            {(c) => (
                              <th class="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {c}
                              </th>
                            )}
                          </For>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={t.rows}>
                          {(row, ri) => {
                            const isTotal = row[0]?.toLowerCase().startsWith("total");
                            return (
                              <tr
                                class={cls(
                                  "border-b border-zinc-50 last:border-0 dark:border-white/[0.03]",
                                  ri() % 2 === 1 && "bg-zinc-50/70 dark:bg-white/[0.03]",
                                  isTotal && "bg-violet-50/70 font-semibold dark:bg-violet-500/[0.07] dark:text-white"
                                )}
                              >
                                <For each={row}>
                                  {(cell, ci) => (
                                    <td class={cls("px-4 py-2.5 text-[13px] text-zinc-600 dark:text-zinc-300", isTotal && "text-zinc-900 dark:text-zinc-50", ci() === 0 && "font-medium")}>
                                      {cell}
                                    </td>
                                  )}
                                </For>
                              </tr>
                            );
                          }}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>

      <Show when={tab() === "data"}>
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div class="card overflow-hidden">
            <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06]">
              <span class="text-sm font-semibold">Extracted fields</span>
              <button class="btn-ghost !px-2.5 !py-1.5 !text-xs" onClick={() => doCopy("json")}>
                <Copy class="h-3.5 w-3.5" /> JSON
              </button>
            </div>
            <Show
              when={d().pairs.length > 0}
              fallback={<div class="px-4 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">No structured fields were detected.</div>}
            >
              <ul class="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                <For each={d().pairs}>
                  {(p) => (
                    <li class="flex items-center gap-4 px-4 py-3">
                      <div class="w-32 shrink-0 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 sm:w-40">
                        {p.key}
                      </div>
                      <div class="min-w-0 flex-1 truncate text-sm font-medium">{p.value}</div>
                      <div class="flex w-24 shrink-0 items-center gap-2">
                        <div class="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                          <div
                            class={cls("h-full rounded-full", p.confidence >= 97 ? "bg-emerald-500" : p.confidence >= 90 ? "bg-violet-500" : "bg-amber-500")}
                            style={{ width: `${p.confidence}%` }}
                          />
                        </div>
                        <span class="w-8 text-right text-[10px] font-semibold tabular-nums text-zinc-400">{p.confidence}%</span>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </div>

          <div class="space-y-4">
            <div class="card p-4">
              <div class="text-sm font-semibold">Detected entities</div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <Show
                  when={entities().length > 0}
                  fallback={<span class="text-xs text-zinc-400 dark:text-zinc-500">None found in this document.</span>}
                >
                  <For each={entities()}>
                    {(e) => (
                      <span class="chip max-w-full !gap-1 font-mono !text-[11px]">
                        <span class="text-[9px] font-bold uppercase text-violet-500 dark:text-violet-300">{e.label}</span>
                        <span class="truncate">{e.value}</span>
                      </span>
                    )}
                  </For>
                </Show>
              </div>
            </div>
            <Show when={d().keywords?.length}>
              <div class="card p-4">
                <div class="text-sm font-semibold">Keywords</div>
                <div class="mt-3 flex flex-wrap gap-1.5">
                  <For each={d().keywords}>
                    {(k) => <span class="chip !text-[11px]">{k}</span>}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      <Show when={tab() === "meta"}>
        <div class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <For
              each={[
                { k: "Pages", v: d().meta?.pages ?? "—" },
                { k: "Words", v: (d().meta?.words ?? 0).toLocaleString() },
                { k: "Characters", v: (d().meta?.chars ?? 0).toLocaleString() },
                { k: "Language", v: d().meta?.language ?? "—" },
                { k: "OCR applied", v: d().meta?.ocrApplied ? "Yes" : "No" },
                { k: "Tables found", v: d().meta?.tablesFound ?? 0 },
                { k: "Parse time", v: `${((d().meta?.parseMs ?? 0) / 1000).toFixed(2)} s` },
                { k: "Extracted at", v: clockTime(d().addedAt) },
                { k: "File size", v: formatBytes(d().size) },
              ]}
            >
              {(s) => (
                <div class="card p-4">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{s.k}</div>
                  <div class="mt-1.5 text-[15px] font-bold tracking-tight">{s.v}</div>
                </div>
              )}
            </For>
          </div>
          <div class="card flex flex-wrap items-center gap-2 p-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span class="chip">Engine · Glyph 2.1.0</span>
            <span class="chip">Schema v3</span>
            <span class="chip">Source · {d().source === "paste" ? "Pasted text" : "File upload"}</span>
            <span class="chip">Processed in-region</span>
          </div>
        </div>
      </Show>
    </div>
  );
}
