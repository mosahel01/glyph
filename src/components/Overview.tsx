import { For, Show, createMemo } from "solid-js";
import { ArrowRight, ArrowUpRight, FilePlus, Files, Gauge, Receipt, Sparkles, Timer, Zap, ClipboardPaste, ScanText } from "lucide-solid";
import { addFiles } from "../lib/parser";
import { docs } from "../lib/store";
import type { ParsedDoc } from "../lib/types";
import { fmtNum, timeAgo } from "../lib/utils";
import { KindIcon, Sparkline, StatusChip, toast } from "./ui";
import type { View } from "./Sidebar";

const CHART = [112, 186, 148, 224, 198, 312, 268, 240, 356, 322, 402, 368, 448, 512];

export function Overview(props: { onOpen: (id: string) => void; onNav: (v: View) => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const done = createMemo(() => docs.list.filter((d) => d.status === "done"));
  const totalDocs = createMemo(() => 20 + docs.list.length);
  const totalPages = createMemo(() => 1184 + done().reduce((s, d) => s + (d.meta?.pages ?? 0), 0));
  const recent = createMemo(() => [...docs.list].sort((a, b) => b.addedAt - a.addedAt).slice(0, 5));

  const stats = () => [
    { label: "Documents parsed", value: fmtNum(totalDocs()), delta: "+6 this week", icon: Files, up: true },
    { label: "Pages processed", value: fmtNum(totalPages()), delta: "+4.2%", icon: ScanText, up: true },
    { label: "Avg. field accuracy", value: "97.4%", delta: "+0.3 pts", icon: Gauge, up: true },
    { label: "Avg. parse time", value: "1.8s", delta: "−12% vs. last week", icon: Timer, up: true },
  ];

  const importSample = () => {
    const f = new File(
      [new Uint8Array(280_000 + Math.floor(Math.random() * 60_000))],
      `sample-invoice-${Math.floor(Math.random() * 9000 + 1000)}.pdf`,
      { type: "application/pdf" }
    );
    addFiles([f]);
    toast("Sample invoice queued for parsing", "info");
  };

  return (
    <div class="animate-fade-up space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">{greeting}, Alex</h1>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Here's what's been parsed across your workspace.
          </p>
        </div>
        <button class="btn-primary !px-3.5 !py-2 !text-[13px]" onClick={() => props.onNav("new")}>
          <Sparkles class="h-4 w-4" />
          New parse
        </button>
      </div>

      {/* stats */}
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <For each={stats()}>
          {(s) => (
            <div class="card card-hover relative overflow-hidden p-5">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</div>
                  <div class="mt-1.5 text-[26px] font-extrabold tracking-tight tabular-nums">{s.value}</div>
                </div>
                <span class="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400">
                  <s.icon class="h-[18px] w-[18px]" />
                </span>
              </div>
              <div class="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight class="h-3 w-3" />
                {s.delta}
              </div>
            </div>
          )}
        </For>
      </div>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* chart + recent */}
        <div class="space-y-4">
          <div class="card p-5">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold">Parsing volume</div>
                <div class="text-xs text-zinc-500 dark:text-zinc-400">Pages processed · last 14 days</div>
              </div>
              <span class="chip !py-1 text-[11px]">
                <Zap class="h-3 w-3 text-violet-500" />
                {fmtNum(CHART.reduce((a, b) => a + b, 0))} pages
              </span>
            </div>
            <div class="mt-4">
              <Sparkline points={CHART} height={120} />
            </div>
            <div class="mt-1 flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
              <span>Nov 1</span>
              <span>Nov 7</span>
              <span>Nov 14</span>
            </div>
          </div>

          <div class="card overflow-hidden">
            <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06]">
              <span class="text-sm font-bold">Recent documents</span>
              <button class="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:gap-1.5 dark:text-violet-300" onClick={() => props.onNav("documents")}>
                View all <ArrowRight class="h-3 w-3" />
              </button>
            </div>
            <ul class="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              <For each={recent()}>
                {(d: ParsedDoc) => (
                  <li
                    class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                    onClick={() => d.status === "done" && props.onOpen(d.id)}
                  >
                    <KindIcon kind={d.kind} class="!h-9 !w-9" iconClass="!h-4.5 !w-4.5" />
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-semibold">{d.name}</div>
                      <div class="text-xs text-zinc-400 dark:text-zinc-500">{timeAgo(d.addedAt)}</div>
                    </div>
                    <StatusChip status={d.status} />
                    <ArrowRight class="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500 dark:text-zinc-600" />
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>

        {/* quick actions */}
        <div class="space-y-4">
          <div class="card p-5">
            <div class="text-sm font-bold">Quick actions</div>
            <div class="mt-3 space-y-2">
              <button
                class="group flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm font-semibold transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/10 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/[0.06]"
                onClick={() => props.onNav("new")}
              >
                <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                  <FilePlus class="h-4 w-4" />
                </span>
                <span class="flex-1 text-left">Parse a document</span>
                <ArrowRight class="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 dark:text-zinc-600" />
              </button>
              <button
                class="group flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm font-semibold transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/10 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/[0.06]"
                onClick={importSample}
              >
                <span class="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                  <Receipt class="h-4 w-4" />
                </span>
                <span class="flex-1 text-left">Import sample invoice</span>
                <ArrowRight class="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 dark:text-zinc-600" />
              </button>
              <button
                class="group flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm font-semibold transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/10 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/[0.06]"
                onClick={() => props.onNav("templates")}
              >
                <span class="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <ClipboardPaste class="h-4 w-4" />
                </span>
                <span class="flex-1 text-left">Browse templates</span>
                <ArrowRight class="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 dark:text-zinc-600" />
              </button>
            </div>
          </div>

          <div class="card relative overflow-hidden p-5">
            <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/25 to-cyan-400/25 blur-2xl" />
            <div class="relative">
              <div class="flex items-center gap-2 text-sm font-bold">
                <Sparkles class="h-4 w-4 text-violet-500" />
                Engine 2.1 is live
              </div>
              <p class="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Layout-aware OCR now reads multi-column scans 2.3× faster, with 99.4% field accuracy on invoices.
              </p>
              <button class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:gap-2 dark:text-violet-300" onClick={() => props.onNav("usage")}>
                See what's new <ArrowRight class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
