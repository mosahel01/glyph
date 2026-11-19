import { createSignal } from "solid-js";
import { Moon, Sun } from "lucide-solid";
import { cls } from "../lib/utils";

const [theme, setTheme] = createSignal<"dark" | "light">(
  typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
);

export function currentTheme() {
  return theme();
}

export function setThemeMode(mode: "dark" | "light") {
  setTheme(mode);
  document.documentElement.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem("glyph-theme", mode);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle(props: { class?: string }) {
  const isDark = () => theme() === "dark";
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setThemeMode(isDark() ? "light" : "dark")}
      class={cls(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100",
        props.class
      )}
    >
      <Sun class={cls("absolute h-[18px] w-[18px] transition-all duration-300", isDark() ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} />
      <Moon class={cls("absolute h-[18px] w-[18px] transition-all duration-300", isDark() ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0")} />
    </button>
  );
}
