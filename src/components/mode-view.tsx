"use client";

import type { ModeId } from "@/lib/commands";
import { Topbar } from "./topbar";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n/use-t";

export function ModeView({ mode }: { mode: Exclude<ModeId, "chat"> }) {
  const messages = useAppStore((s) => s.messages);
  const t = useT();
  const meta = t.modeTopbar[mode];

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      <Topbar mode={meta.label} sub={meta.sub} />
      <MessageList messages={messages} />
      <Composer placeholder={t.composer.modePlaceholder(mode)} />
    </main>
  );
}
