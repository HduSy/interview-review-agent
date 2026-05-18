"use client";

import { ModeBadge } from "./mode-badge";

export function Topbar({
  mode,
  sub,
}: {
  mode?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-8 py-4 border-b border-hairline bg-canvas">
      {mode ? (
        <ModeBadge label={mode} sub={sub} />
      ) : (
        <div className="text-[13px] text-muted">新对话</div>
      )}
    </div>
  );
}
