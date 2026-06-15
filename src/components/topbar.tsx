"use client";

import { ModeBadge } from "./mode-badge";
import { useT } from "@/lib/i18n/use-t";

export function Topbar({
  mode,
  sub,
}: {
  mode?: string;
  sub?: string;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-4 px-8 py-4 border-b border-hairline bg-canvas">
      {mode ? (
        <ModeBadge label={mode} sub={sub} />
      ) : (
        <div className="text-[13px] text-muted">{t.modeTopbar.newConversation}</div>
      )}
    </div>
  );
}
