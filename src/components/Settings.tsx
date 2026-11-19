import { For, createSignal } from "solid-js";
import { Monitor, Moon, Sun, Trash, UserRound } from "lucide-solid";
import { settings, setSettings } from "../lib/store";
import { cls } from "../lib/utils";
import { setThemeMode, currentTheme } from "./ThemeToggle";
import { Toggle, toast } from "./ui";

export function Settings() {
  const [name, setName] = createSignal("Alex Kim");
  const [email, setEmail] = createSignal("alex@acme.io");
  const [org, setOrg] = createSignal("Acme Corporation");
  const [armed, setArmed] = createSignal(false);

  const theme = () => currentTheme();

  return (
    <div class="animate-fade-up max-w-3xl space-y-5">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Profile, parsing defaults and workspace controls.</p>
      </div>

      {/* profile */}
      <div class="card p-5">
        <div class="flex items-center gap-2 text-sm font-bold">
          <UserRound class="h-4 w-4 text-violet-500" />
          Profile
        </div>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Full name</span>
            <input class="field" value={name()} onInput={(e) => setName(e.currentTarget.value)} />
          </label>
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Email</span>
            <input class="field" type="email" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} />
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Workspace name</span>
            <input class="field" value={org()} onInput={(e) => setOrg(e.currentTarget.value)} />
          </label>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="btn-primary !px-3.5 !py-2 !text-[13px]" onClick={() => toast("Profile saved")}>
            Save changes
          </button>
        </div>
      </div>

      {/* parsing defaults */}
      <div class="card p-5">
        <div class="text-sm font-bold">Parsing defaults</div>
        <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Applied to every new document unless overridden in the parse view.</p>
        <div class="mt-3 divide-y divide-zinc-100 dark:divide-white/[0.06]">
          <Toggle label="Layout-aware OCR" desc="On by default for scans and PDFs" checked={settings.ocr} onChange={(v) => setSettings("ocr", v)} />
          <div class="pt-1"><Toggle label="Table detection" desc="Rebuild tables as structured grids" checked={settings.tables} onChange={(v) => setSettings("tables", v)} /></div>
          <div class="pt-1"><Toggle label="Preserve original layout" desc="Keep pagination and columns" checked={settings.layout} onChange={(v) => setSettings("layout", v)} /></div>
        </div>
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">OCR language</span>
            <select class="field" value={settings.language} onChange={(e) => setSettings("language", e.currentTarget.value)}>
              <For each={["Auto-detect", "English", "German", "French", "Spanish", "Japanese", "Portuguese"]}>
                {(l) => <option value={l}>{l}</option>}
              </For>
            </select>
          </label>
          <label class="block">
            <span class="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Default output</span>
            <select class="field" value={settings.output} onChange={(e) => setSettings("output", e.currentTarget.value)}>
              <For each={["Structured", "Markdown", "JSON", "Plain text"]}>{(o) => <option value={o}>{o}</option>}</For>
            </select>
          </label>
        </div>
      </div>

      {/* appearance */}
      <div class="card p-5">
        <div class="text-sm font-bold">Appearance</div>
        <div class="mt-3 flex gap-2">
          <For
            each={[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ] as const
            }
          >
            {(o) => (
              <button
                class={cls(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                  theme() === o.id
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/20"
                )}
                onClick={() => {
                  if (o.id !== "system") setThemeMode(o.id);
                  else toast("System theme follows your OS in this demo", "info");
                }}
              >
                <o.icon class="h-4 w-4" />
                {o.label}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* danger zone */}
      <div class="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-500/20 dark:bg-rose-500/[0.06]">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-sm font-bold text-rose-600 dark:text-rose-300">Danger zone</div>
            <p class="mt-0.5 text-xs text-rose-500/80 dark:text-rose-300/70">
              Deleting the workspace removes all documents and parsed data. This cannot be undone.
            </p>
          </div>
          <button
            class={cls(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              armed()
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:brightness-110"
                : "border border-rose-300 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
            )}
            onClick={() => {
              if (armed()) {
                toast("Relax — it's a demo, nothing was deleted", "err");
                setArmed(false);
              } else {
                setArmed(true);
                setTimeout(() => setArmed(false), 4000);
              }
            }}
          >
            <Trash class="h-4 w-4" />
            {armed() ? "Really delete? Click again" : "Delete workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
