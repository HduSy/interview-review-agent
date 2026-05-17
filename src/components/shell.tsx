"use client";

import { useEffect } from "react";
import { Rail } from "./rail";
import { ExpandedSidebar } from "./expanded-sidebar";
import { Welcome } from "./welcome";
import { ModeView } from "./mode-view";
import { HistoryView } from "./history-view";
import { SettingsModal } from "./settings-modal";
import { useAppStore } from "@/lib/store";

export function Shell() {
  const view = useAppStore((s) => s.view);
  const chatMode = useAppStore((s) => s.chatMode);
  const sidebarExpanded = useAppStore((s) => s.sidebarExpanded);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div className="h-screen flex bg-canvas text-ink overflow-hidden">
      {sidebarExpanded ? <ExpandedSidebar /> : <Rail />}

      {view.kind === "chat"
        ? chatMode === "chat"
          ? <Welcome />
          : <ModeView mode={chatMode} />
        : <HistoryView mode={view.mode} />}

      <SettingsModal />
    </div>
  );
}
