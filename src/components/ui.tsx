import { createSignal, For, onCleanup, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { FileKind, ParseStatus } from "../lib/types";
import { cls } from "../lib/utils";

/* ---------------- toasts ---------------- */

type Toast = { id: number; msg: string; kind: "ok" | "info" | "err" };
const [toasts, setToasts] = createSignal<Toast[]>([]);
let tid = 0;

export function toast(msg: string, kind: Toast["kind"] = "ok") {
  const id = ++tid;
  setToasts((t) => [...t, { id, msg, kind }]);
  setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
}

export function Toaster() {
  return (
    <div class="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
      <For each={toasts()}>
        {(t) => (
          <div class="animate-slide-in pointer-events-auto flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-xl shadow-zinc-900/10 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/50">
            <span
              class={cls(
                "h-2 w-2 shrink-0 rounded-full",
                t.kind === "ok" ? "bg-emerald-500" : t.kind === "err" ? "bg-rose-500" : "bg-indigo-500"
              )}
            />
            {t.msg}
          </div>
        )}
      </For>
    </div>
  );
}

/* ---------------- status ---------------- */

const STATUS: Record<ParseStatus, { label: string; dot: string; tone: string }> = {
  queued: { label: "Queued", dot: "bg-zinc-400", tone: "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300" },
  parsing: { label: "Parsing", dot: "bg-indigo-500 animate-pulse", tone: "border-indigo-200/70 bg-indigo-50 text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300" },
  done: { label: "Parsed", dot: "bg-emerald-500", tone: "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300" },
  error: { label: "Error", dot: "bg-rose-500", tone: "border-rose-200/70 bg-rose-50 text-rose-600 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300" },
  canceled: { label: "Canceled", dot: "bg-amber-500", tone: "border-amber-200/70 bg-amber-50 text-amber-600 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300" },
};

export function StatusChip(props: { status: ParseStatus; class?: string }) {
  const s = () => STATUS[props.status];
  return (
    <span
      class={cls(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        s().tone,
        props.class
      )}
    >
      <span class={cls("h-1.5 w-1.5 rounded-full", s().dot)} />
      {s().label}
    </span>
  );
}

export function Progress(props: { value: number; class?: string }) {
  return (
    <div class={cls("h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/10", props.class)}>
      <div
        class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-150 ease-out"
        style={{ width: `${props.value}%` }}
      />
    </div>
  );
}

/* ---------------- confidence ring ---------------- */

export function Ring(props: { value: number; size?: number }) {
  const size = () => props.size ?? 56;
  const r = () => (size() - 8) / 2;
  const c = () => 2 * Math.PI * r();
  return (
    <div class="relative grid shrink-0 place-items-center" style={{ width: `${size()}px`, height: `${size()}px` }}>
      <svg width={size()} height={size()} class="-rotate-90">
        <circle cx={size() / 2} cy={size() / 2} r={r()} fill="none" stroke-width="6" class="stroke-zinc-200 dark:stroke-white/10" />
        <circle
          cx={size() / 2}
          cy={size() / 2}
          r={r()}
          fill="none"
          stroke-width="6"
          stroke-linecap="round"
          stroke="url(#ringGrad)"
          stroke-dasharray={String(c())}
          stroke-dashoffset={String(c() * (1 - Math.min(100, Math.max(0, props.value)) / 100))}
          style={{ transition: "stroke-dashoffset .7s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="#8b5cf6" />
            <stop offset="1" stop-color="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <span class="absolute text-xs font-bold tabular-nums">
        {Math.round(props.value)}
        <span class="text-[9px] text-zinc-400">%</span>
      </span>
    </div>
  );
}

/* ---------------- sparkline / area chart ---------------- */

export function Sparkline(props: { points: number[]; height?: number; class?: string }) {
  const h = () => props.height ?? 56;
  const w = 260;
  const pts = () => props.points;
  const max = () => Math.max(...pts(), 1);
  const min = () => Math.min(...pts(), 0);
  const xy = (i: number) => {
    const x = (i / (pts().length - 1)) * w;
    const y = h() - 8 - ((pts()[i] - min()) / (max() - min() || 1)) * (h() - 16);
    return [x, y] as const;
  };
  const line = () =>
    pts()
      .map((_, i) => {
        const [x, y] = xy(i);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  const area = () => `${line()} L${w},${h()} L0,${h()} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h()}`} preserveAspectRatio="none" class={cls("w-full", props.class)} style={{ height: `${h()}px` }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#8b5cf6" stop-opacity="0.35" />
          <stop offset="1" stop-color="#8b5cf6" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d={area()} fill="url(#sparkGrad)" />
      <path d={line()} fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------------- toggle switch ---------------- */

export function Toggle(props: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      onClick={() => props.onChange(!props.checked)}
      class="group flex w-full items-center justify-between gap-4 rounded-xl px-1 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
    >
      <span>
        <span class="block text-sm font-medium">{props.label}</span>
        {props.desc && <span class="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{props.desc}</span>}
      </span>
      <span
        class={cls(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200",
          props.checked ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-zinc-300 dark:bg-white/15"
        )}
      >
        <span
          class={cls(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
            props.checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

/* ---------------- file-kind icon ---------------- */

export function KindIcon(props: { kind: FileKind; class?: string; iconClass?: string }) {
  const cfgs: Record<FileKind, { icon: Component<{ class?: string }>; tone: string }> = {
    pdf: { icon: IconPdf, tone: "bg-rose-500/10 text-rose-500 dark:text-rose-400" },
    docx: { icon: IconDoc, tone: "bg-blue-500/10 text-blue-500 dark:text-blue-400" },
    image: { icon: IconImage, tone: "bg-amber-500/10 text-amber-500 dark:text-amber-400" },
    sheet: { icon: IconSheet, tone: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" },
    text: { icon: IconText, tone: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400" },
    other: { icon: IconOther, tone: "bg-zinc-400/10 text-zinc-500 dark:text-zinc-400" },
  };
  const c = () => cfgs[props.kind] ?? cfgs.other;
  return (
    <span class={cls("grid h-10 w-10 shrink-0 place-items-center rounded-xl", c().tone, props.class)}>
      <Dynamic component={c().icon} class={cls("h-5 w-5", props.iconClass)} />
    </span>
  );
}

/* Inline SVG icons (zero deps, guaranteed availability) */

const IconPdf: Component<{ class?: string }> = (p) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" />
    <text x="12" y="17.2" text-anchor="middle" font-size="6.5" font-family="inherit" fill="currentColor" stroke="none" font-weight="700">PDF</text>
  </svg>
);
const IconDoc: Component<{ class?: string }> = (p) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h5" />
  </svg>
);
const IconImage: Component<{ class?: string }> = (p) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-4-4-8 8" />
  </svg>
);
const IconSheet: Component<{ class?: string }> = (p) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
);
const IconText: Component<{ class?: string }> = (p) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" />
    <path d="M8 12h8M8 16h8" />
  </svg>
);
const IconOther: Component<{ class?: string }> = (p) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" />
    <circle cx="11" cy="14" r="3" />
    <path d="m13.3 16.3 2 2" />
  </svg>
);

/* ---------------- misc ---------------- */

export function SectionLabel(props: { children: string }) {
  return <div class="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">{props.children}</div>;
}

export function Spinner(props: { class?: string }) {
  return (
    <svg class={cls("animate-spin", props.class ?? "h-4 w-4")} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
  );
}

/** Interval helper that self-cleans */
export function useInterval(fn: () => void, ms: number) {
  const iv = setInterval(fn, ms);
  onCleanup(() => clearInterval(iv));
}
