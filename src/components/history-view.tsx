"use client";

import { ArrowRight, Plus, Search } from "lucide-react";
import clsx from "clsx";
import type { ModeId } from "@/lib/commands";
import { HISTORY_STUB, MODE_META } from "@/lib/history-stub";
import { useAppStore } from "@/lib/store";

const FILTERS = ["全部", "Google", "字节", "Stripe", "其它"];

export function HistoryView({ mode }: { mode: Exclude<ModeId, "chat"> }) {
  const newChat = useAppStore((s) => s.newChat);
  const items = HISTORY_STUB[mode];
  const meta = MODE_META[mode];
  const [headBefore, headAfter] = meta.headline.split("{n}");

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
      <div className="px-8 sm:px-14 pt-10 pb-6 border-b border-hairline">
        <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
          <div>
            <div className="text-[12px] text-muted tracking-[0.08em] uppercase mb-2">
              /{mode} · 历史
            </div>
            <h1
              className="font-medium m-0 text-[32px] sm:text-[44px] leading-[1.1] tracking-[-0.02em] text-ink"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {headBefore}
              <span className="text-primary">{items.length}</span>
              {headAfter}
            </h1>
          </div>
          <button
            onClick={newChat}
            className="bg-primary hover:bg-primary-active text-white text-[13px] font-medium px-4 py-2 rounded-md inline-flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2} className="text-white" />
            开始新的 /{mode}
          </button>
        </div>
        <div className="text-[13px] text-body">{meta.metric}</div>
      </div>

      <div className="px-8 sm:px-14 py-3 flex gap-2 items-center border-b border-hairline-soft flex-wrap">
        {FILTERS.map((t, i) => (
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

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-2 pb-6">
        {items.map((m) => (
          <button
            key={m.id}
            className="w-full flex items-center gap-5 px-6 py-4 rounded-xl border-b border-hairline-soft text-left hover:bg-surface-soft transition-colors"
          >
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white font-medium text-lg shrink-0"
              style={{
                background: m.accent ?? "var(--color-surface-dark)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {m.title.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2.5 mb-1">
                <span
                  className="font-medium text-ink text-[20px] tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {m.title}
                </span>
                {m.sub && <span className="text-[14px] text-muted">{m.sub}</span>}
              </div>
            </div>
            <div className="text-[13px] text-muted min-w-[100px] text-right">{m.date}</div>
            {m.meta && (
              <div className="font-mono text-[12px] text-muted min-w-[60px] text-right">
                {m.meta}
              </div>
            )}
            {m.badge && (
              <div
                className="min-w-[44px] h-8 rounded-full flex items-center justify-center px-3 bg-surface-card text-ink text-[16px] font-medium"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {m.badge}
              </div>
            )}
            <ArrowRight size={16} strokeWidth={1.8} className="text-muted shrink-0" />
          </button>
        ))}
      </div>
    </main>
  );
}
