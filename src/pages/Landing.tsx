import { For, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { A } from "@solidjs/router";
import {
  ArrowRight, Braces, Check, FileDown, FileText, Languages, LayoutTemplate,
  Menu, Quote, ScanText, ShieldCheck, Sparkles, Star, Table2, X, Zap,
} from "lucide-solid";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useInterval } from "../components/ui";
import { cls } from "../lib/utils";

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

const GithubIcon = (p: { class?: string }) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.67.41.36.78 1.06.78 2.14 0 1.54-.01 2.78-.01 3.16 0 .31.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);
const XIcon = (p: { class?: string }) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
  </svg>
);
const LinkedinIcon = (p: { class?: string }) => (
  <svg class={p.class} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

function Nav() {
  const [scrolled, setScrolled] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  onMount(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", fn));
  });

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Formats", href: "#formats" },
    { label: "Customers", href: "#customers" },
  ];

  return (
    <header
      class={cls(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled() || open()
          ? "border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-zinc-950/80"
          : "border-b border-transparent"
      )}
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <A href="/">
          <Logo />
        </A>

        <nav class="ml-8 hidden items-center gap-1 md:flex">
          <For each={links}>
            {(l) => (
              <a href={l.href} class="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white">
                {l.label}
              </a>
            )}
          </For>
        </nav>

        <div class="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <a href="https://github.com" target="_blank" rel="noreferrer" class="btn-icon hidden sm:inline-flex" aria-label="GitHub">
            <GithubIcon class="h-[18px] w-[18px]" />
          </a>
          <A href="/app" class="btn-primary !px-3.5 !py-2 !text-[13px]">
            Open the app
          </A>
          <button class="btn-icon md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <Show when={open()} fallback={<Menu class="h-[18px] w-[18px]" />}>
              <X class="h-[18px] w-[18px]" />
            </Show>
          </button>
        </div>
      </div>

      <Show when={open()}>
        <nav class="border-t border-zinc-200/70 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-zinc-950/95 md:hidden">
          <For each={links}>
            {(l) => (
              <a href={l.href} onClick={() => setOpen(false)} class="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]">
                {l.label}
              </a>
            )}
          </For>
        </nav>
      </Show>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Animated hero demo — cycles idle → upload → parse → results         */
/* ------------------------------------------------------------------ */

const DEMO_LINES = [
  { icon: Zap, text: "Revenue reached $18.2M — up 18% year over year", tag: "field · 99%" },
  { icon: Table2, text: "Table reconstructed — Revenue by region (5 rows)", tag: "table · 98%" },
  { icon: Braces, text: "Due date → Nov 27, 2025 · Total → $14,860.00", tag: "fields · 97%" },
  { icon: FileText, text: "24 pages · 2,481 words · English detected", tag: "meta" },
];

function HeroDemo() {
  const [t, setT] = createSignal(0);
  useInterval(() => setT((v) => (v + 1) % 84), 90);

  const phase = createMemo(() => {
    const v = t();
    if (v < 12) return "idle";
    if (v < 17) return "upload";
    if (v < 40) return "parsing";
    if (v < 74) return "done";
    return "out";
  });
  const progress = createMemo(() => {
    const v = t();
    if (v < 12) return 0;
    if (v < 17) return ((v - 12) / 5) * 20;
    if (v < 40) return 20 + ((v - 17) / 23) * 80;
    return 100;
  });
  const stage = createMemo(() => {
    const v = t();
    if (v < 17) return "Uploading file…";
    if (v < 24) return "Extracting text layer";
    if (v < 31) return "Running OCR — page 3/24";
    if (v < 37) return "Detecting tables";
    return "Resolving fields";
  });
  const revealed = createMemo(() => Math.max(0, t() - 40));

  return (
    <div class="relative">
      {/* glow + floating chips */}
      <div class="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-gradient-to-tr from-violet-500/25 via-fuchsia-500/10 to-cyan-400/25 opacity-70 blur-3xl dark:opacity-60" />
      <div class="animate-float absolute -right-6 -top-7 z-10 hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white/90 px-3.5 py-2 text-xs font-semibold shadow-xl shadow-zinc-900/10 backdrop-blur dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/40 sm:flex">
        <FileText class="h-4 w-4 text-violet-500" /> PDF · 24 pages
      </div>
      <div class="animate-float-slow absolute -bottom-7 -left-5 z-10 hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white/90 px-3.5 py-2 text-xs font-semibold shadow-xl shadow-zinc-900/10 backdrop-blur dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/40 sm:flex">
        <ScanText class="h-4 w-4 text-cyan-500" /> Layout-aware OCR · on
      </div>

      <div class="card overflow-hidden !rounded-3xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/50">
        {/* window chrome */}
        <div class="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span class="ml-3 truncate rounded-md bg-zinc-200/70 px-2.5 py-1 font-mono text-[10.5px] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            glyph.dev/app — parse workspace
          </span>
        </div>

        <div class="p-5 sm:p-6">
          <Show
            when={phase() === "done" || phase() === "out"}
            fallback={
              <div>
                {/* uploading / parsing */}
                <div class="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-4 dark:border-white/15 dark:bg-white/[0.03]">
                  <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
                    <FileText class="h-5 w-5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2 text-sm font-semibold">
                      <span class="truncate">q3-business-review.pdf</span>
                      <span class="shrink-0 text-xs tabular-nums text-zinc-400">{Math.round(progress())}%</span>
                    </div>
                    <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/10">
                      <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-[width] duration-150" style={{ width: `${progress()}%` }} />
                    </div>
                    <div class="mt-1.5 font-mono text-[10.5px] text-indigo-500 dark:text-indigo-300">{stage()}…</div>
                  </div>
                </div>
                <div class="mt-4 space-y-2.5">
                  <div class="shimmer h-3 w-3/4 rounded bg-zinc-100 dark:bg-white/[0.05]" />
                  <div class="shimmer h-3 w-1/2 rounded bg-zinc-100 dark:bg-white/[0.05]" />
                  <div class="shimmer h-3 w-2/3 rounded bg-zinc-100 dark:bg-white/[0.05]" />
                </div>
              </div>
            }
          >
            {/* results */}
            <div class="animate-pop">
              <div class="flex items-center gap-2.5">
                <span class="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Check class="h-4 w-4" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-bold">q3-business-review.pdf — parsed</div>
                  <div class="text-[11px] text-zinc-400 dark:text-zinc-500">Glyph 2.1.0 · 1.8s</div>
                </div>
                <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">97.2%</span>
              </div>
              <div class="mt-4 space-y-2">
                <For each={DEMO_LINES}>
                  {(l, i) => (
                    <div
                      class="flex items-center gap-2.5 rounded-xl border border-zinc-100 px-3 py-2.5 transition-all duration-300 dark:border-white/[0.06]"
                      style={{
                        opacity: revealed() > i() ? "1" : "0",
                        transform: revealed() > i() ? "none" : "translateY(6px)",
                      }}
                    >
                      <l.icon class="h-4 w-4 shrink-0 text-violet-500" />
                      <span class="min-w-0 flex-1 truncate text-[12.5px] text-zinc-600 dark:text-zinc-300">{l.text}</span>
                      <span class="shrink-0 font-mono text-[9.5px] font-semibold text-emerald-600/90 dark:text-emerald-400/90">{l.tag}</span>
                    </div>
                  )}
                </For>
              </div>
              <div class="mt-4 flex items-center gap-2 opacity-80">
                <div class="shimmer h-9 flex-1 rounded-xl border border-dashed border-zinc-300 dark:border-white/15" />
                <div class="h-9 w-9 shrink-0 rounded-lg bg-zinc-100 dark:bg-white/[0.05]" />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section class="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div class="pointer-events-none absolute inset-0 dots text-zinc-400/25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] dark:text-zinc-500/15" />
      <div class="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-400/20 blur-3xl" />

      <div class="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div class="animate-fade-up chip !rounded-full !px-3.5 !py-1.5">
            <Sparkles class="h-3.5 w-3.5 text-violet-500" />
            New — layout-aware OCR engine 2.1
          </div>

          <h1 class="animate-fade-up-late mt-5 text-[42px] font-extrabold leading-[1.05] tracking-tighter sm:text-6xl">
            Any document.
            <br />
            Parsed to <span class="text-gradient">perfection.</span>
          </h1>

          <p class="animate-fade-up-later mt-5 max-w-lg text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Glyph turns PDFs, scans, spreadsheets and Word docs into clean, structured data —
            with layout-aware OCR, rebuilt tables and field-level confidence scores.
          </p>

          <div class="animate-fade-up-later mt-7 flex flex-wrap items-center gap-3">
            <A href="/app" class="btn-primary !px-5 !py-3 !text-[15px]">
              Start parsing — it's free
              <ArrowRight class="h-4 w-4" />
            </A>
            <a href="#how" class="btn-ghost !px-5 !py-3 !text-[15px]">
              See how it works
            </a>
          </div>

          <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span class="flex items-center gap-1.5"><ShieldCheck class="h-3.5 w-3.5 text-emerald-500" /> SOC 2 Type II</span>
            <span class="flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
            <span class="flex items-center gap-1.5"><Check class="h-3.5 w-3.5 text-emerald-500" /> 50 free parses / month</span>
          </div>
        </div>

        <div class="animate-fade-up-later">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Logos() {
  return (
    <section class="border-y border-zinc-200/70 bg-white/60 py-8 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[13px] font-bold tracking-wide text-zinc-400 dark:text-zinc-500">
          <span class="w-full pb-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400/80 dark:text-zinc-500/80">Trusted by document-heavy teams at</span>
          <span class="transition hover:text-zinc-600 dark:hover:text-zinc-300">Northwind</span>
          <span class="transition hover:text-zinc-600 dark:hover:text-zinc-300">Helios</span>
          <span class="transition hover:text-zinc-600 dark:hover:text-zinc-300">Meridian</span>
          <span class="transition hover:text-zinc-600 dark:hover:text-zinc-300">Bluepeak</span>
          <span class="transition hover:text-zinc-600 dark:hover:text-zinc-300">Oakline</span>
          <span class="transition hover:text-zinc-600 dark:hover:text-zinc-300">Lumina</span>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: ScanText, title: "OCR that reads like a human", desc: "Layout-aware recognition reconstructs reading order across columns, headers and footnotes — not just raw text." },
  { icon: Table2, title: "Tables, perfectly rebuilt", desc: "Merged cells, multi-row headers and totals are detected and reassembled into clean, exportable grids." },
  { icon: Braces, title: "Field-level extraction", desc: "Key-value fields come back named and typed, each with a confidence score you can gate on." },
  { icon: LayoutTemplate, title: "Layout preservation", desc: "Optionally keep pagination and column structure intact for pixel-faithful downstream rendering." },
  { icon: Languages, title: "30+ OCR languages", desc: "Automatic script detection with per-language models — from English and German to Japanese." },
  { icon: FileDown, title: "Export anywhere", desc: "Markdown, JSON, CSV or plain text. One click in the app, or a single API call in your stack." },
];

function Features() {
  return (
    <section id="features" class="py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-xl text-center">
          <div class="chip !rounded-full">Everything you need</div>
          <h2 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Parsing that holds up to <span class="text-gradient">scrutiny</span>
          </h2>
          <p class="mt-3 text-[15px] text-zinc-500 dark:text-zinc-400">
            Built for operations teams who can't afford “roughly right” — every extraction is auditable.
          </p>
        </div>

        <div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={FEATURES}>
            {(f) => (
              <div class="card card-hover group p-6">
                <span class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-violet-600 transition group-hover:from-violet-500 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-500/30 dark:text-violet-400">
                  <f.icon class="h-5 w-5" />
                </span>
                <h3 class="mt-4 text-[15px] font-bold tracking-tight">{f.title}</h3>
                <p class="mt-1.5 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Drop it in", desc: "Drag files into the workspace or POST them to the API. Batch uploads welcome." },
    { n: "02", title: "Glyph parses", desc: "Text, structure, tables and fields are extracted — with confidence on every field." },
    { n: "03", title: "Export & automate", desc: "Review the result side-by-side with the source, then export or webhook it onward." },
  ];
  return (
    <section id="how" class="border-y border-zinc-200/70 bg-white/60 py-24 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-xl text-center">
          <div class="chip !rounded-full">Three steps</div>
          <h2 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">From mess to <span class="text-gradient">data</span> in seconds</h2>
        </div>
        <div class="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <For each={steps}>
            {(s, i) => (
              <div class="relative text-center md:text-left">
                <Show when={i() < steps.length - 1}>
                  <ArrowRight class="absolute -right-6 top-8 hidden h-5 w-5 text-zinc-300 dark:text-zinc-700 md:block" />
                </Show>
                <div class="text-5xl font-extrabold tracking-tighter text-gradient">{s.n}</div>
                <h3 class="mt-3 text-lg font-bold tracking-tight">{s.title}</h3>
                <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 md:mx-0">{s.desc}</p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

function Formats() {
  const tiles = [
    { abbr: "PDF", note: "Text + OCR fallback" },
    { abbr: "DOCX", note: "Styles & headings" },
    { abbr: "XLSX", note: "Workbook aware" },
    { abbr: "CSV", note: "Typed columns" },
    { abbr: "PNG · JPG", note: "Layout OCR" },
    { abbr: "TXT · MD", note: "Instant, local" },
    { abbr: "RTF · ODT", note: "Legacy friendly" },
    { abbr: "HTML", note: "Structure mapped" },
  ];
  return (
    <section id="formats" class="py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div class="chip !rounded-full">Supported formats</div>
            <h2 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              If it holds text, <span class="text-gradient">Glyph reads it</span>
            </h2>
            <p class="mt-3 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Eight format families out of the box, 40+ more through the API — including legacy
              formats nobody else wants to touch. Plain text files parse instantly, right in your
              browser, for free.
            </p>
            <div class="mt-6 flex items-center gap-3 text-sm font-semibold">
              <A href="/app" class="text-violet-600 inline-flex items-center gap-1.5 transition hover:gap-2.5 dark:text-violet-300">
                Try it with your own file <ArrowRight class="h-4 w-4" />
              </A>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            <For each={tiles}>
              {(t) => (
                <div class="card card-hover p-4 text-center">
                  <div class="font-mono text-sm font-bold tracking-tight">{t.abbr}</div>
                  <div class="mt-1 text-[10.5px] leading-snug text-zinc-400 dark:text-zinc-500">{t.note}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "38M+", l: "documents parsed weekly" },
    { v: "99.4%", l: "field-level accuracy" },
    { v: "1.8s", l: "average parse time" },
    { v: "30+", l: "OCR languages" },
  ];
  return (
    <section class="border-y border-zinc-200/70 bg-white/60 py-16 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div class="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 sm:px-6 lg:grid-cols-4">
        <For each={stats}>
          {(s) => (
            <div class="text-center">
              <div class="text-4xl font-extrabold tracking-tighter text-gradient sm:text-5xl">{s.v}</div>
              <div class="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.l}</div>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section id="customers" class="py-24">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <div class="card relative p-8 text-center sm:p-10">
          <span class="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
            <Quote class="h-5 w-5" />
          </span>
          <div class="mt-4 flex justify-center gap-1">
            <For each={[0, 1, 2, 3, 4]}>
              {() => <Star class="h-4 w-4 fill-amber-400 text-amber-400" />}
            </For>
          </div>
          <blockquote class="mt-5 text-xl font-semibold leading-relaxed tracking-tight sm:text-2xl">
            “Glyph cut our invoice processing from 20 minutes to 30 seconds per document.
            The field accuracy is genuinely uncanny.”
          </blockquote>
          <div class="mt-6 flex items-center justify-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-xs font-bold text-white">MC</span>
            <div class="text-left">
              <div class="text-sm font-bold">Maya Chen</div>
              <div class="text-xs text-zinc-500 dark:text-zinc-400">Head of Operations, Northwind</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section class="px-4 pb-24 sm:px-6">
      <div class="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-zinc-200/80 bg-gradient-to-br from-violet-500/[0.08] via-fuchsia-500/[0.05] to-cyan-400/[0.08] px-6 py-16 text-center dark:border-white/[0.08] dark:from-violet-500/[0.12] dark:via-fuchsia-500/[0.06] dark:to-cyan-400/[0.12] sm:py-20">
        <div class="pointer-events-none absolute inset-0 dots text-violet-500/20 dark:text-violet-400/10" />
        <div class="relative">
          <h2 class="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to parse your first document?
          </h2>
          <p class="mx-auto mt-4 max-w-md text-[15px] text-zinc-500 dark:text-zinc-400">
            Open the workspace, drop a file, and watch it become structured data — in under three seconds.
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <A href="/app" class="btn-primary !px-6 !py-3.5 !text-[15px]">
              <Sparkles class="h-4.5 w-4.5" style={{ height: "18px", width: "18px" }} />
              Open the workspace
            </A>
            <a href="#features" class="btn-ghost !px-6 !py-3.5 !text-[15px]">
              Explore features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: { title: string; links: string[] }[] = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: "Resources", links: ["Documentation", "API reference", "Status", "Blog"] },
    { title: "Company", links: ["About", "Careers", "Contact", "Press"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer class="border-t border-zinc-200/70 dark:border-white/[0.06]">
      <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div class="grid gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p class="mt-4 max-w-xs text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              The document parser for teams who care about what's actually in their files.
            </p>
            <div class="mt-5 flex items-center gap-1">
              <a href="https://github.com" target="_blank" rel="noreferrer" class="btn-icon" aria-label="GitHub"><GithubIcon class="h-[18px] w-[18px]" /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" class="btn-icon" aria-label="X"><XIcon class="h-[18px] w-[18px]" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" class="btn-icon" aria-label="LinkedIn"><LinkedinIcon class="h-[18px] w-[18px]" /></a>
            </div>
          </div>
          <For each={cols}>
            {(c) => (
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{c.title}</div>
                <ul class="mt-4 space-y-2.5">
                  <For each={c.links}>
                    {(l) => (
                      <li>
                        <a href="#" class="text-[13px] text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">{l}</a>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </div>
        <div class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/70 pt-6 text-xs text-zinc-400 dark:border-white/[0.06] dark:text-zinc-500">
          <span>© 2026 Glyph Labs, Inc. All rights reserved.</span>
          <span class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function Landing() {
  return (
    <div class="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Features />
        <HowItWorks />
        <Formats />
        <Stats />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
