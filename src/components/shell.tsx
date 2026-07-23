"use client";

import { useEffect, useState } from "react";
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
  // We use a useState lazy initializer (runs once, during this component's
  // first render, but BEFORE any child mounts) so the store update commits
  // before Rail / Welcome subscribe. Calling setState directly in the render
  // body is a React 19 anti-pattern: it cascades the update into siblings
  // that are currently rendering and throws "Cannot update a component while
  // rendering a different component." The lazy initializer is the sanctioned
  // way to perform a one-shot side effect during render.
  useState(() => {
    if (useAppStore.getState().locale !== initialLocale) {
      setActiveLocale(initialLocale);
      useAppStore.getInitialState().locale = initialLocale;
      useAppStore.setState({ locale: initialLocale });
    }
    return initialLocale;
  });

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
