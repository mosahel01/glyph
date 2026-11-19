import { For, type Component } from "solid-js";
import { ArrowRight, Landmark, LayoutTemplate, Receipt, ScrollText, UserRound, IdCard, ShieldCheck } from "lucide-solid";
import { setActiveTemplate } from "../lib/store";
import { toast } from "./ui";
import type { View } from "./Sidebar";

type Tpl = {
  name: string;
  desc: string;
  fields: number;
  accuracy: string;
  icon: Component<{ class?: string }>;
  tone: string;
};

const TEMPLATES: Tpl[] = [
  { name: "Invoice", desc: "Vendor, dates, line items, totals, tax and PO numbers.", fields: 14, accuracy: "99.4%", icon: Receipt, tone: "bg-violet-500/10 text-violet-500 dark:text-violet-400" },
  { name: "Receipt", desc: "Merchant, items, payment method and totals from scans.", fields: 9, accuracy: "97.8%", icon: ScrollText, tone: "bg-amber-500/10 text-amber-500 dark:text-amber-400" },
  { name: "Contract", desc: "Parties, effective dates, term, notices and signatures.", fields: 12, accuracy: "98.2%", icon: Landmark, tone: "bg-blue-500/10 text-blue-500 dark:text-blue-400" },
  { name: "Resume", desc: "Contact details, roles, skills and education sections.", fields: 10, accuracy: "96.9%", icon: UserRound, tone: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" },
  { name: "Bank statement", desc: "Transactions, balances, account and period metadata.", fields: 11, accuracy: "98.6%", icon: ShieldCheck, tone: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400" },
  { name: "ID document", desc: "Names, document numbers, expiry and issuing country.", fields: 8, accuracy: "97.1%", icon: IdCard, tone: "bg-rose-500/10 text-rose-500 dark:text-rose-400" },
];

export function Templates(props: { onNav: (v: View) => void }) {
  const use = (name: string) => {
    setActiveTemplate(name);
    toast(`${name} template applied — drop a file to extract`, "info");
    props.onNav("new");
  };

  return (
    <div class="animate-fade-up space-y-5">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Templates</h1>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pre-trained schemas that map parsed content into named, typed fields.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <For each={TEMPLATES}>
          {(t) => (
            <div class="card card-hover flex flex-col p-5">
              <div class="flex items-start justify-between">
                <span class={`grid h-11 w-11 place-items-center rounded-xl ${t.tone}`}>
                  <t.icon class="h-5 w-5" />
                </span>
                <span class="chip !py-0.5 text-[10px]">{t.fields} fields</span>
              </div>
              <h3 class="mt-3.5 text-[15px] font-bold tracking-tight">{t.name}</h3>
              <p class="mt-1 flex-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{t.desc}</p>
              <div class="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-white/[0.06]">
                <span class="text-xs text-zinc-400 dark:text-zinc-500">
                  Field accuracy <span class="font-semibold text-emerald-600 dark:text-emerald-400">{t.accuracy}</span>
                </span>
                <button class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-50 hover:gap-1.5 dark:text-violet-300 dark:hover:bg-violet-500/10" onClick={() => use(t.name)}>
                  Use <ArrowRight class="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class="card flex flex-wrap items-center gap-4 p-5">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
          <LayoutTemplate class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-bold">Need a custom schema?</div>
          <p class="text-[13px] text-zinc-500 dark:text-zinc-400">
            Define fields in the dashboard or via the API — Glyph fine-tunes extraction per schema.
          </p>
        </div>
        <button class="btn-ghost !px-3.5 !py-2 !text-[13px]" onClick={() => props.onNav("usage")}>
          Open API docs
        </button>
      </div>
    </div>
  );
}
