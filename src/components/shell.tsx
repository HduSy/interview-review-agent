"use client";

import { useEffect } from "react";
import { Rail } from "./rail";
import { ExpandedSidebar } from "./expanded-sidebar";
import { Welcome } from "./welcome";
import { ModeView } from "./mode-view";
import { HistoryView } from "./history-view";
import { SettingsModal } from "./settings-modal";
import { Toaster } from "./toaster";
import { useAppStore } from "@/lib/store";
import { setActiveLocale } from "@/lib/i18n/runtime";
import type { Locale } from "@/lib/i18n/locale";

export function Shell({ initialLocale }: { initialLocale: Locale }) {
  // Seed the store from the server-read cookie BEFORE any child reads `locale`
  // via useT(), so the SSR body matches the cookie-driven <html lang> and there
  // is no hydration mismatch / flash of the default language.
  //
  // Crucially this mutates getInitialState(), not just setState: zustand's
  // useSyncExternalStore server snapshot reads getInitialState() (see
  // node_modules/zustand/esm/react.mjs), so during SSR the children render with
  // the *initial* state, not the current one. We run in the client module graph
  // here (Shell is "use client"), which is the same store instance the children
  // use — unlike the server-graph store that page.tsx sees.
  if (useAppStore.getState().locale !== initialLocale) {
    setActiveLocale(initialLocale);
    useAppStore.getInitialState().locale = initialLocale;
    useAppStore.setState({ locale: initialLocale });
  }

  const view = useAppStore((s) => s.view);
  const chatMode = useAppStore((s) => s.chatMode);
  const sidebarExpanded = useAppStore((s) => s.sidebarExpanded);
  const hydrate = useAppStore((s) => s.hydrate);
  const loadGithubUser = useAppStore((s) => s.loadGithubUser);

  useEffect(() => {
    void hydrate();
    void loadGithubUser();
  }, [hydrate, loadGithubUser]);

  return (
    <div className="h-screen flex bg-canvas text-ink overflow-hidden">
      {sidebarExpanded ? <ExpandedSidebar /> : <Rail />}

      {view.kind === "chat"
        ? chatMode === "chat"
          ? <Welcome />
          : <ModeView mode={chatMode} />
        : <HistoryView mode={view.mode} />}

      <SettingsModal />
      <Toaster />
    </div>
  );
}
