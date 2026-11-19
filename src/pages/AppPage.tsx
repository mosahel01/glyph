import { Show, Switch, Match, createSignal, onMount } from "solid-js";
import { Sidebar, MobileBackdrop, type View } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { Dropzone } from "../components/Dropzone";
import { FileQueue } from "../components/FileQueue";
import { ResultView } from "../components/ResultView";
import { Overview } from "../components/Overview";
import { Documents } from "../components/Documents";
import { Templates } from "../components/Templates";
import { Usage } from "../components/Usage";
import { Settings } from "../components/Settings";
import { seedDocs, findDoc } from "../lib/store";
import type { ParsedDoc } from "../lib/types";

const CRUMBS: Record<View, string> = {
  overview: "Overview",
  new: "New parse",
  documents: "Documents",
  templates: "Templates",
  usage: "Usage & API",
  settings: "Settings",
};

export default function AppPage() {
  const [view, setView] = createSignal<View>("new");
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [menuOpen, setMenuOpen] = createSignal(false);

  onMount(() => {
    seedDocs();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const openDoc = (id: string) => {
    const d = findDoc(id);
    if (d && d.status === "done") {
      setSelectedId(id);
      setMenuOpen(false);
    }
  };

  const selected = (): ParsedDoc | null => {
    const id = selectedId();
    if (!id) return null;
    const d = findDoc(id);
    return d && d.status === "done" ? d : null;
  };

  const crumb = () => selected()?.name ?? CRUMBS[view()];

  return (
    <div class="min-h-screen">
      <Sidebar
        view={view()}
        onNav={(v) => {
          setView(v);
          setSelectedId(null);
          setMenuOpen(false);
        }}
        open={menuOpen()}
        onClose={() => setMenuOpen(false)}
      />
      <MobileBackdrop show={menuOpen()} onClose={() => setMenuOpen(false)} />

      <div class="lg:pl-[264px]">
        <Topbar
          crumb={crumb()}
          onMenu={() => setMenuOpen(true)}
          onNew={() => {
            setView("new");
            setSelectedId(null);
          }}
        />

        <main class="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
          <Show when={selected()} fallback={<InnerView view={view()} onOpen={openDoc} onNav={setView} />}>
            {(doc) => <ResultView doc={doc()} onBack={() => setSelectedId(null)} />}
          </Show>
        </main>
      </div>
    </div>
  );
}

function InnerView(props: { view: View; onOpen: (id: string) => void; onNav: (v: View) => void }) {
  return (
    <Switch>
      <Match when={props.view === "overview"}>
        <Overview onOpen={props.onOpen} onNav={props.onNav} />
      </Match>
      <Match when={props.view === "new"}>
        <div class="animate-fade-up space-y-6">
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight">New parse</h1>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Drop files or paste text — results appear in the queue below as they finish.
            </p>
          </div>
          <Dropzone />
          <FileQueue onOpen={props.onOpen} limit={6} onViewAll={() => props.onNav("documents")} />
        </div>
      </Match>
      <Match when={props.view === "documents"}>
        <Documents onOpen={props.onOpen} onNav={props.onNav} />
      </Match>
      <Match when={props.view === "templates"}>
        <Templates onNav={props.onNav} />
      </Match>
      <Match when={props.view === "usage"}>
        <Usage />
      </Match>
      <Match when={props.view === "settings"}>
        <Settings />
      </Match>
    </Switch>
  );
}
