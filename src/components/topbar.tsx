"use client";

import { Clock, MoreHorizontal } from "lucide-react";
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
      <div className="flex-1" />
      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-muted hover:bg-surface-card text-xs">
        <Clock size={14} strokeWidth={1.8} />
        <span className="text-body">历史</span>
      </button>
      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-muted hover:bg-surface-card">
        <MoreHorizontal size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}
