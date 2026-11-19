import { For, Show, createMemo } from "solid-js";
import { ArrowRight, RotateCcw, X } from "lucide-solid";
import { cancelParse, retry } from "../lib/parser";
import { docs } from "../lib/store";
import type { ParsedDoc } from "../lib/types";
import { cls, formatBytes, kindLabel, timeAgo } from "../lib/utils";
import { KindIcon, Progress, Spinner, StatusChip } from "./ui";

export function FileQueue(props: { onOpen: (id: string) => void; onViewAll?: () => void; limit?: number }) {
  const list = createMemo(() => {
    const sorted = [...docs.list].sort((a, b) => b.addedAt - a.addedAt);
    return props.limit ? sorted.slice(0, props.limit) : sorted;
  });

  return (
    <div class="card overflow-hidden">
      <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06]">
        <div class="flex items-center gap-2 text-sm font-semibold">
          Queue
          <span class="chip !px-2 !py-0 text-[10px]">{docs.list.length}</span>
        </div>
        <Show when={props.onViewAll && docs.list.length > (props.limit ?? Infinity)}>
          <button class="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:gap-1.5 dark:text-violet-300" onClick={props.onViewAll}>
            View all <ArrowRight class="h-3 w-3" />
          </button>
        </Show>
      </div>
      <Show
        when={docs.list.length > 0}
        fallback={
          <div class="px-4 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
            Nothing here yet — drop a file above to get started.
          </div>
        }
      >
        <ul class="divide-y divide-zinc-100 dark:divide-white/[0.06]">
          <For each={list()}>
            {(doc) => <QueueRow doc={doc} onOpen={props.onOpen} />}
          </For>
        </ul>
      </Show>
    </div>
  );
}

function QueueRow(props: { doc: ParsedDoc; onOpen: (id: string) => void }) {
  const d = () => props.doc;
  const clickable = () => d().status === "done";
  return (
    <li
      class={cls(
        "group flex items-center gap-3 px-4 py-3 transition",
        clickable() ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.03]" : ""
      )}
      onClick={() => clickable() && props.onOpen(d().id)}
    >
      <KindIcon kind={d().kind} />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="truncate text-sm font-semibold">{d().name}</span>
          <span class="hidden shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500 sm:inline">
            {formatBytes(d().size)} · {timeAgo(d().addedAt)}
          </span>
        </div>

        <Show
          when={d().status === "parsing"}
          fallback={
            <Show
              when={d().status === "done"}
              fallback={
                <Show
                  when={d().status === "error"}
                  fallback={
                    <div class="truncate text-xs text-zinc-400 dark:text-zinc-500">
                      {d().status === "canceled" ? "Canceled before completion" : `Waiting · ${kindLabel[d().kind]}`}
                    </div>
                  }
                >
                  <div class="truncate text-xs text-rose-500 dark:text-rose-400">{d().error}</div>
                </Show>
              }
            >
              <div class="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {d().stage} · {Math.round(d().confidence ?? 0)}% confidence
                {d().meta?.pages ? ` · ${d().meta!.pages} page${d().meta!.pages > 1 ? "s" : ""}` : ""}
              </div>
            </Show>
          }
        >
          <div class="mt-1 flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-300">
            <Spinner class="h-3 w-3" />
            <span class="truncate">
              {d().stage}
              {d().stageDetail ? ` — ${d().stageDetail}` : ""}
            </span>
          </div>
        </Show>
      </div>

      {/* right side actions */}
      <div class="flex shrink-0 items-center gap-2">
        <Show when={d().status === "parsing" || d().status === "queued"}>
          <Progress value={d().progress} class="hidden w-28 sm:block" />
          <button
            class="btn-icon !h-8 !w-8 opacity-60 hover:opacity-100"
            title="Cancel"
            onClick={(e) => {
              e.stopPropagation();
              cancelParse(d().id);
            }}
          >
            <X class="h-4 w-4" />
          </button>
        </Show>

        <Show when={d().status === "done"}>
          <StatusChip status="done" />
          <span class="hidden items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:flex">
            {Math.round(d().confidence ?? 0)}%
          </span>
        </Show>

        <Show when={d().status === "error" || d().status === "canceled"}>
          <StatusChip status={d().status} />
          <button
            class="btn-icon !h-8 !w-8"
            title="Retry"
            onClick={(e) => {
              e.stopPropagation();
              retry(d().id);
            }}
          >
            <RotateCcw class="h-4 w-4" />
          </button>
        </Show>

        <Show when={clickable()}>
          <span class="hidden text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500 dark:text-zinc-600 sm:block">
            <ArrowRight class="h-4 w-4" />
          </span>
        </Show>
      </div>
    </li>
  );
}
