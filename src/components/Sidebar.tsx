import { For, Show, type Component } from "solid-js";
import { ChartColumn, Files, LayoutDashboard, LayoutTemplate, LifeBuoy, LogOut, Settings2, Sparkles, X } from "lucide-solid";
import { Logo } from "./Logo";
import { SectionLabel } from "./ui";
import { cls } from "../lib/utils";

export type View = "overview" | "new" | "documents" | "templates" | "usage" | "settings";

const items: { id: View; label: string; icon: Component<{ class?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "new", label: "New parse", icon: Sparkles },
  { id: "documents", label: "Documents", icon: Files },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "usage", label: "Usage & API", icon: ChartColumn },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export function Sidebar(props: { view: View; onNav: (v: View) => void; open: boolean; onClose: () => void }) {
  return (
    <aside
      class={cls(
        "fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-zinc-200 bg-white transition-transform duration-300 dark:border-white/[0.06] dark:bg-zinc-950 lg:translate-x-0",
        props.open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div class="flex h-16 items-center justify-between px-5">
        <Logo />
        <button class="btn-icon lg:hidden" onClick={props.onClose} aria-label="Close menu">
          <X class="h-4.5 w-4.5" style={{ height: "18px", width: "18px" }} />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 pb-4">
        <SectionLabel>Workspace</SectionLabel>
        <div class="space-y-1">
          <For each={items}>
            {(item) => {
              const active = () => props.view === item.id;
              return (
                <button
                  onClick={() => props.onNav(item.id)}
                  class={cls(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active()
                      ? "bg-zinc-100 text-zinc-900 dark:bg-white/[0.07] dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-100"
                  )}
                >
                  <span
                    class={cls(
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-500 to-cyan-400 transition-opacity",
                      active() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <item.icon class={cls("h-[18px] w-[18px] transition-colors", active() ? "text-violet-600 dark:text-violet-300" : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300")} />
                  {item.label}
                </button>
              );
            }}
          </For>
        </div>

        <div class="mt-6 rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-4 dark:border-white/[0.06] dark:from-white/[0.04] dark:to-transparent">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold">Storage</span>
            <span class="text-zinc-500 dark:text-zinc-400">2.4 / 10 GB</span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
            <div class="h-full w-[24%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
          </div>
          <div class="mt-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Pro plan · renews Dec 1, 2026
          </div>
        </div>
      </nav>

      <div class="border-t border-zinc-200 p-3 dark:border-white/[0.06]">
        <div class="flex items-center gap-3 rounded-xl px-2 py-2">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
            AK
          </span>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold">Alex Kim</div>
            <div class="truncate text-xs text-zinc-500 dark:text-zinc-400">alex@acme.io</div>
          </div>
          <button class="btn-icon" title="Sign out" onClick={() => props.onNav("settings")}>
            <LogOut class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-1 flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <LifeBuoy class="h-3.5 w-3.5" />
          Docs &amp; support — press ⌘K
        </div>
      </div>
    </aside>
  );
}

export function MobileBackdrop(props: { show: boolean; onClose: () => void }) {
  return (
    <Show when={props.show}>
      <div class="fixed inset-0 z-30 bg-zinc-950/40 backdrop-blur-sm lg:hidden" onClick={props.onClose} />
    </Show>
  );
}
