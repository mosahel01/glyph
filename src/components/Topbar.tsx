import type { Component } from "solid-js";
import { Bell, ChevronRight, Menu, Plus, Search } from "lucide-solid";
import { ThemeToggle } from "./ThemeToggle";
import { cls } from "../lib/utils";

export function Topbar(props: { crumb: string; onMenu: () => void; onNew: () => void }) {
  return (
    <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-white/[0.06] dark:bg-zinc-950/80 sm:px-6">
      <button class="btn-icon lg:hidden" onClick={props.onMenu} aria-label="Open menu">
        <Menu class="h-[18px] w-[18px]" />
      </button>

      <div class="flex min-w-0 items-center gap-1.5 text-sm">
        <span class="hidden text-zinc-500 dark:text-zinc-400 sm:inline">Acme workspace</span>
        <ChevronRight class="hidden h-4 w-4 text-zinc-300 dark:text-zinc-600 sm:inline" />
        <span class="truncate font-semibold">{props.crumb}</span>
      </div>

      <div class="ml-auto hidden w-64 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-500 md:flex xl:w-72">
        <Search class="h-4 w-4" />
        <span class="flex-1 truncate">Search documents…</span>
        <kbd class="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
          ⌘K
        </kbd>
      </div>

      <div class={cls("ml-auto flex items-center gap-1 md:ml-2")}>
        <button class="btn-icon" aria-label="Notifications">
          <Bell class="h-[18px] w-[18px]" />
          <span class="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500 dark:border-zinc-950" />
        </button>
        <ThemeToggle />
        <button onClick={props.onNew} class="btn-primary ml-1 hidden !px-3.5 !py-2 !text-[13px] sm:inline-flex">
          <Plus class="h-4 w-4" />
          New parse
        </button>
        <span class="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white ring-2 ring-white dark:ring-zinc-900">
          AK
        </span>
      </div>
    </header>
  );
}
