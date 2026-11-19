import { For, Show, createMemo, createSignal } from "solid-js";
import { ArrowRight, Download, Eye, Files, Search, Trash } from "lucide-solid";
import { docs, removeDoc } from "../lib/store";
import type { ParsedDoc } from "../lib/types";
import { cls, download, formatBytes, kindLabel, timeAgo, toMarkdown } from "../lib/utils";
import { KindIcon, StatusChip, toast } from "./ui";
import type { View } from "./Sidebar";

type Filter = "all" | "done" | "parsing" | "error";

export function Documents(props: { onOpen: (id: string) => void; onNav: (v: View) => void }) {
  const [query, setQuery] = createSignal("");
  const [filter, setFilter] = createSignal<Filter>("all");

  const filtered = createMemo(() => {
    let list = [...docs.list];
    const q = query().trim().toLowerCase();
    if (q) list = list.filter((d) => d.name.toLowerCase().includes(q));
    const f = filter();
    if (f === "done") list = list.filter((d) => d.status === "done");
    if (f === "parsing") list = list.filter((d) => d.status === "parsing" || d.status === "queued");
    if (f === "error") list = list.filter((d) => d.status === "error" || d.status === "canceled");
    return list.sort((a, b) => b.addedAt - a.addedAt);
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "done", label: "Parsed" },
    { id: "parsing", label: "In progress" },
    { id: "error", label: "Issues" },
  ];

  return (
    <div class="animate-fade-up space-y-5">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight">Documents</h1>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Everything parsed in this workspace.</p>
        </div>
        <button class="btn-primary !px-3.5 !py-2 !text-[13px]" onClick={() => props.onNav("new")}>
          <ArrowRight class="h-4 w-4" />
          Parse a document
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900/60 sm:max-w-xs">
          <Search class="h-4 w-4 text-zinc-400" />
          <input
            class="w-full bg-transparent outline-none placeholder:text-zinc-400"
            placeholder="Search by name…"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
        </div>
        <div class="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-zinc-900/60">
          <For each={filters}>
            {(f) => (
              <button
                onClick={() => setFilter(f.id)}
                class={cls(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  filter() === f.id
                    ? "bg-zinc-900 text-white dark:bg-white/[0.12] dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}
              >
                {f.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <Show
        when={filtered().length > 0}
        fallback={
          <div class="card grid place-items-center px-4 py-20 text-center">
            <div>
              <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/[0.06]">
                <Files class="h-6 w-6" />
              </div>
              <div class="mt-4 text-base font-bold">Nothing here yet</div>
              <p class="mx-auto mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
                {query() ? "No documents match your search." : "Parsed documents will appear here, ready to review and export."}
              </p>
              <button class="btn-primary mt-5" onClick={() => props.onNav("new")}>
                Parse a document
              </button>
            </div>
          </div>
        }
      >
        <div class="card overflow-hidden">
          {/* header row (desktop) */}
          <div class="hidden grid-cols-[minmax(0,1fr)_120px_110px_110px_150px] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:border-white/[0.06] dark:text-zinc-500 md:grid">
            <span>Name</span>
            <span>Status</span>
            <span>Confidence</span>
            <span>Added</span>
            <span class="text-right">Actions</span>
          </div>
          <ul class="divide-y divide-zinc-100 dark:divide-white/[0.06]">
            <For each={filtered()}>
              {(d) => <DocRow doc={d} onOpen={props.onOpen} />}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}

function DocRow(props: { doc: ParsedDoc; onOpen: (id: string) => void }) {
  const d = () => props.doc;
  const viewable = () => d().status === "done";

  return (
    <li
      class={cls(
        "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_120px_110px_110px_150px]",
        viewable() ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.03]" : ""
      )}
      onClick={() => viewable() && props.onOpen(d().id)}
    >
      <div class="flex min-w-0 items-center gap-3">
        <KindIcon kind={d().kind} />
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold">{d().name}</div>
          <div class="truncate text-xs text-zinc-400 dark:text-zinc-500">
            {kindLabel[d().kind]} · {formatBytes(d().size)}
            {d().meta?.pages ? ` · ${d().meta!.pages}p` : ""}
          </div>
        </div>
      </div>

      <div class="hidden md:block"><StatusChip status={d().status} /></div>

      <div class="hidden text-sm font-semibold tabular-nums md:block">
        {viewable() ? (
          <span class={cls((d().confidence ?? 0) >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
            {Math.round(d().confidence ?? 0)}%
          </span>
        ) : (
          <span class="text-zinc-400">—</span>
        )}
      </div>

      <div class="hidden text-xs text-zinc-400 dark:text-zinc-500 md:block">{timeAgo(d().addedAt)}</div>

      <div class="flex items-center justify-end gap-1">
        <Show when={viewable()}>
          <button
            class="btn-icon !h-8 !w-8 opacity-0 transition group-hover:opacity-100 max-md:opacity-100"
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              props.onOpen(d().id);
            }}
          >
            <Eye class="h-4 w-4" />
          </button>
          <button
            class="btn-icon !h-8 !w-8 opacity-0 transition group-hover:opacity-100 max-md:opacity-100"
            title="Download as Markdown"
            onClick={(e) => {
              e.stopPropagation();
              download(`${d().name.replace(/\.[^.]+$/, "")}.md`, toMarkdown(d()), "text/markdown");
              toast("Markdown downloaded");
            }}
          >
            <Download class="h-4 w-4" />
          </button>
        </Show>
        <button
          class="btn-icon !h-8 !w-8 hover:!text-rose-500 dark:hover:!text-rose-400"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            removeDoc(d().id);
            toast("Document removed", "info");
          }}
        >
          <Trash class="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
