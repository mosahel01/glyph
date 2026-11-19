import { For, createSignal } from "solid-js";
import { CreditCard, Copy, FileText, Globe, KeyRound, Plus, Zap } from "lucide-solid";
import { cls, copyText } from "../lib/utils";
import { Progress, toast } from "./ui";

const BARS = [
  { label: "Documents", used: 68, quota: 200, unit: "" },
  { label: "Pages", used: 3412, quota: 10000, unit: "" },
  { label: "API calls", used: 1204, quota: 5000, unit: "" },
];

const CALLS = [
  { ep: "POST /v1/parse", code: 200, time: "1.4 s", at: "2 min ago" },
  { ep: "POST /v1/parse", code: 200, time: "2.1 s", at: "9 min ago" },
  { ep: "GET /v1/documents", code: 200, time: "84 ms", at: "31 min ago" },
  { ep: "POST /v1/parse", code: 429, time: "—", at: "1 h ago" },
];

export function Usage() {
  const [revealed, setRevealed] = createSignal(false);

  return (
    <div class="animate-fade-up space-y-5">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Usage &amp; API</h1>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Plan, quota and programmatic access to the parsing engine.</p>
      </div>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-4">
          {/* plan + quota */}
          <div class="card p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                  <Zap class="h-5 w-5" />
                </span>
                <div>
                  <div class="text-sm font-bold">Glyph Pro</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">$29 / month · renews Dec 1, 2026</div>
                </div>
              </div>
              <button class="btn-ghost !px-3.5 !py-2 !text-[13px]" onClick={() => toast("This demo doesn't process billing", "info")}>
                <CreditCard class="h-4 w-4" />
                Manage plan
              </button>
            </div>
            <div class="mt-5 space-y-4">
              <For each={BARS}>
                {(b) => {
                  const pct = Math.round((b.used / b.quota) * 100);
                  return (
                    <div>
                      <div class="mb-1.5 flex items-center justify-between text-xs">
                        <span class="font-semibold">{b.label}</span>
                        <span class="tabular-nums text-zinc-500 dark:text-zinc-400">
                          {b.used.toLocaleString()} / {b.quota.toLocaleString()} · {pct}%
                        </span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-white/10">
                        <div
                          class={cls(
                            "h-full rounded-full",
                            pct < 70 ? "bg-gradient-to-r from-violet-500 to-indigo-500" : pct < 90 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>

          {/* api calls */}
          <div class="card overflow-hidden">
            <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-white/[0.06]">
              <span class="text-sm font-bold">Recent API calls</span>
              <span class="chip !py-0 text-[10px]">live</span>
            </div>
            <ul class="divide-y divide-zinc-100 font-mono text-[12.5px] dark:divide-white/[0.06]">
              <For each={CALLS}>
                {(c) => (
                  <li class="flex items-center gap-3 px-4 py-2.5">
                    <span class="min-w-0 flex-1 truncate">{c.ep}</span>
                    <span
                      class={cls(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                        c.code === 200 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {c.code}
                    </span>
                    <span class="w-14 text-right text-zinc-500 dark:text-zinc-400">{c.time}</span>
                    <span class="hidden w-24 text-right text-zinc-400 dark:text-zinc-500 sm:inline">{c.at}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>

        <div class="space-y-4">
          {/* api key */}
          <div class="card p-5">
            <div class="flex items-center gap-2 text-sm font-bold">
              <KeyRound class="h-4 w-4 text-violet-500" />
              API key
            </div>
            <div class="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-[12.5px] dark:border-white/10 dark:bg-white/[0.04]">
              <span class="min-w-0 flex-1 truncate">{revealed() ? "gl_live_9fK2mXq7Ld0pR4vTnB8sZ6yH" : "gl_live_••••••••••••••••d2a8"}</span>
              <button
                class="btn-icon !h-7 !w-7"
                title="Copy key"
                onClick={async () => {
                  await copyText("gl_live_9fK2mXq7Ld0pR4vTnB8sZ6yH");
                  toast("API key copied");
                }}
              >
                <Copy class="h-3.5 w-3.5" />
              </button>
            </div>
            <div class="mt-3 flex items-center justify-between text-xs">
              <span class="text-zinc-500 dark:text-zinc-400">Created Oct 2, 2026</span>
              <button class="font-semibold text-violet-600 hover:underline dark:text-violet-300" onClick={() => setRevealed((v) => !v)}>
                {revealed() ? "Hide" : "Reveal"}
              </button>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <For each={["parse:read", "parse:write", "templates:read"]}>{(s) => <span class="chip font-mono !text-[10px]">{s}</span>}</For>
            </div>
          </div>

          {/* quickstart */}
          <div class="card p-5">
            <div class="flex items-center gap-2 text-sm font-bold">
              <Globe class="h-4 w-4 text-violet-500" />
              Quickstart
            </div>
            <pre class="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 font-mono text-[11.5px] leading-relaxed text-zinc-700 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-300"><code>{`curl https://api.glyph.dev/v1/parse \\
  -H "Authorization: Bearer gl_live_…" \\
  -F "file=@invoice.pdf" \\
  -F "template=invoice"`}</code></pre>
            <p class="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              Returns structured JSON with fields, tables and confidence scores.
            </p>
          </div>

          {/* integrations */}
          <div class="card p-5">
            <div class="text-sm font-bold">Integrations</div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <For each={["Slack", "Notion", "Zapier", "S3", "Webhooks", "Google Drive"]}>
                {(n) => (
                  <button class="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/10 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/[0.06]" onClick={() => toast(`${n} integration is coming soon`, "info")}>
                    <span class="flex items-center gap-2">
                      <FileText class="h-3.5 w-3.5 text-zinc-400" />
                      {n}
                    </span>
                    <Plus class="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
