"use client";

import { Plus, Search } from "lucide-react";
import clsx from "clsx";
import type { HistoryMeta, StatBadge } from "@/lib/history-stub";
import { useAppStore } from "@/lib/store";
import type { ModeId } from "@/lib/commands";

export function HistoryShell({
  mode,
  meta,
  children,
}: {
  mode: Exclude<ModeId, "chat">;
  meta: HistoryMeta;
  children: React.ReactNode;
}) {
  const newChat = useAppStore((s) => s.newChat);

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-hairline">
        <div className="flex items-end justify-between gap-4 mb-[18px] flex-wrap">
          <div>
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
          <button
            onClick={newChat}
            className="bg-primary hover:bg-primary-active text-white text-[13px] font-medium px-4 py-2 rounded-md inline-flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2} className="text-white" />
            {meta.ctaLabel}
          </button>
        </div>
        <StatsRow stats={meta.stats} />
      </div>

      <div className="px-8 sm:px-14 py-3.5 flex gap-2 items-center border-b border-hairline-soft flex-wrap">
        {meta.filters.map((t, i) => (
          <span
            key={t}
            className={clsx(
              "px-3 py-1.5 rounded-md text-[13px] font-medium cursor-pointer",
              i === 0
                ? "bg-surface-cream-strong text-ink"
                : "text-muted hover:bg-surface-card",
            )}
          >
            {t}
          </span>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-canvas border border-hairline rounded-md w-[220px]">
          <Search size={13} strokeWidth={1.8} className="text-muted" />
          <span className="text-[13px] text-muted-soft">搜索历史…</span>
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
