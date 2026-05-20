"use client";

import { Search, X } from "lucide-react";
import clsx from "clsx";
import type { HistoryMeta, StatBadge } from "@/lib/history-meta";
import type { ModeId } from "@/lib/commands";

export function HistoryShell({
  mode,
  meta,
  activeFilter,
  onSelectFilter,
  search,
  onSearchChange,
  children,
}: {
  mode: Exclude<ModeId, "chat">;
  meta: HistoryMeta;
  activeFilter: string;
  onSelectFilter: (f: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-hairline">
        <div className="mb-[18px]">
          <div className="text-[12px] text-muted tracking-[0.08em] uppercase mb-2">
            /{mode} · 历史
          </div>
          <h1
            className="font-medium m-0 text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {meta.headline.map((seg, i) =>
              typeof seg === "string" ? (
                <span key={i}>{seg}</span>
              ) : (
                <span key={i} className="text-primary">
                  {seg.primary}
                </span>
              ),
            )}
          </h1>
        </div>
        <StatsRow stats={meta.stats} />
      </div>

      <div className="px-8 sm:px-14 py-3.5 flex gap-2 items-center border-b border-hairline-soft flex-wrap">
        {meta.filters.map((t) => {
          const active = t === activeFilter;
          return (
            <button
              key={t}
              onClick={() => onSelectFilter(t)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                active
                  ? "bg-surface-cream-strong text-ink"
                  : "text-muted hover:bg-surface-card",
              )}
            >
              {t}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-canvas border border-hairline rounded-md w-[220px] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(204,120,92,0.15)]">
          <Search size={13} strokeWidth={1.8} className="text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索历史…"
            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-ink placeholder:text-muted-soft"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="text-muted hover:text-ink shrink-0"
              aria-label="清空搜索"
            >
              <X size={12} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-8 py-2 pb-6">
        {children}
      </div>
    </main>
  );
}

function StatsRow({ stats }: { stats: StatBadge[] }) {
  return (
    <div className="flex gap-[22px] items-center text-[13px] text-body flex-wrap">
      {stats.map((s, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i > 0 && <span className="text-hairline">·</span>}
          <span>
            <strong className={s.color === "primary" ? "text-primary" : "text-ink"}>
              {s.v}
            </strong>{" "}
            {s.label && <span className="text-muted">{s.label}</span>}
          </span>
        </span>
      ))}
    </div>
  );
}
