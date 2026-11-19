import { cls } from "../lib/utils";

export function Logo(props: { class?: string; compact?: boolean }) {
  return (
    <span class={cls("inline-flex items-center gap-2.5", props.class)}>
      <span class="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/30">
        <svg viewBox="0 0 64 64" class="h-4.5 w-4.5" style={{ height: "18px", width: "18px" }}>
          <g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 24h10" />
            <path d="M20 32h16" />
            <path d="M20 40h12" />
            <path d="M44 20 36 44" />
          </g>
        </svg>
      </span>
      {!props.compact && <span class="text-[17px] font-extrabold tracking-tight">Glyph</span>}
    </span>
  );
}
