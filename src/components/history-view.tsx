"use client";

import { ArrowRight, Wand2 } from "lucide-react";
import clsx from "clsx";
import type { ModeId } from "@/lib/commands";
import {
  HISTORY_META,
  HISTORY_STUB,
  type MockHistoryItem,
  type OptimizeHistoryItem,
  type PracticeHistoryItem,
  type PredictHistoryItem,
  type ReviewHistoryItem,
} from "@/lib/history-stub";
import { HistoryShell } from "./history-shell";

export function HistoryView({ mode }: { mode: Exclude<ModeId, "chat"> }) {
  const meta = HISTORY_META[mode];

  return (
    <HistoryShell mode={mode} meta={meta}>
      {mode === "mock" && <MockList items={HISTORY_STUB.mock} />}
      {mode === "review" && <ReviewList items={HISTORY_STUB.review} />}
      {mode === "practice" && <PracticeList items={HISTORY_STUB.practice} />}
      {mode === "predict" && <PredictList items={HISTORY_STUB.predict} />}
      {mode === "optimize" && <OptimizeList items={HISTORY_STUB.optimize} />}
    </HistoryShell>
  );
}

// ─── Mock ────────────────────────────────────────────────────────────

function MockList({ items }: { items: MockHistoryItem[] }) {
  return (
    <div>
      {items.map((m) => (
        <button
          key={m.id}
          className="w-full flex items-center gap-5 px-6 py-4 border-b border-hairline-soft text-left hover:bg-surface-soft transition-colors"
        >
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center text-white font-medium text-lg shrink-0"
            style={{
              background: m.accent ?? "var(--color-surface-dark)",
              fontFamily: "var(--font-serif)",
            }}
          >
            {m.co.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2.5 mb-1">
              <span
                className="font-medium text-ink text-[20px] tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {m.co}
              </span>
              <span className="text-[14px] text-muted">{m.role}</span>
            </div>
            <div className="text-[13px] text-muted">{m.round}</div>
          </div>
          <div className="text-[13px] text-muted min-w-[100px] text-right">{m.date}</div>
          <div className="font-mono text-[12px] text-muted min-w-[60px] text-right">
            {m.duration}
          </div>
          <div
            className="min-w-[44px] h-8 rounded-full flex items-center justify-center px-3 bg-surface-card text-ink text-[16px] font-medium"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {m.grade}
          </div>
          <ArrowRight size={16} strokeWidth={1.8} className="text-muted shrink-0" />
        </button>
      ))}
    </div>
  );
}

// ─── Review ──────────────────────────────────────────────────────────

function ReviewList({ items }: { items: ReviewHistoryItem[] }) {
  return (
    <div>
      {items.map((it) => (
        <button
          key={it.id}
          className="w-full flex items-center gap-[22px] px-6 py-4 border-b border-hairline-soft text-left hover:bg-surface-soft transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2.5 mb-1">
              <span
                className="font-medium text-ink text-[19px] tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {it.co}
              </span>
              <span className="text-[13px] text-muted">{it.round}</span>
            </div>
            <div className="font-mono text-[11px] text-muted-soft">{it.source}</div>
          </div>
          <StarBars values={it.star} />
          <div className="min-w-[140px] text-[12px] text-body bg-surface-card px-2.5 py-1.5 rounded-md">
            {it.top}
          </div>
          <div className="text-[13px] text-muted min-w-[90px] text-right">{it.date}</div>
          <ArrowRight size={16} strokeWidth={1.8} className="text-muted shrink-0" />
        </button>
      ))}
    </div>
  );
}

function StarBars({ values }: { values: [number, number, number, number] }) {
  const labels = ["S", "T", "A", "R"] as const;
  return (
    <div className="flex gap-2.5 items-center">
      {labels.map((k, j) => {
        const v = values[j];
        const color =
          v > 80
            ? "var(--color-success)"
            : v > 50
              ? "var(--color-accent-amber)"
              : "var(--color-primary)";
        return (
          <div key={k} className="flex flex-col items-center gap-1 w-7">
            <div className="relative w-1 h-6 bg-hairline rounded-[2px] overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-[2px]"
                style={{ height: `${v}%`, background: color }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted font-medium">{k}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Practice ────────────────────────────────────────────────────────

function PracticeList({ items }: { items: PracticeHistoryItem[] }) {
  return (
    <div>
      <div className="px-6 pb-2 pt-4">
        <Heatmap />
      </div>
      {items.map((it) => (
        <button
          key={it.id}
          className="w-full flex items-center gap-4 px-6 py-3.5 border-b border-hairline-soft text-left hover:bg-surface-soft transition-colors"
        >
          <span className="font-mono text-[12px] text-muted-soft min-w-[28px]">
            #{it.n}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-ink mb-1 font-medium truncate">{it.q}</div>
            <div className="flex gap-2 items-center">
              <TypePill type={it.type} />
              <span className="font-mono text-[11px] text-muted">{it.duration}</span>
            </div>
          </div>
          <span
            className={clsx(
              "font-medium text-[22px] tracking-[-0.02em] min-w-8 text-center",
              ratingClass(it.rating),
            )}
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {it.rating}
          </span>
          <span className="text-[13px] text-muted min-w-[70px] text-right">{it.date}</span>
          <ArrowRight size={16} strokeWidth={1.8} className="text-muted shrink-0" />
        </button>
      ))}
    </div>
  );
}

function ratingClass(r: string): string {
  if (r.startsWith("A")) return "text-success";
  if (r.startsWith("B")) return "text-ink";
  return "text-primary";
}

function TypePill({ type }: { type: string }) {
  const tone = type.includes("系统")
    ? "amber"
    : type.includes("行为")
      ? "teal"
      : type.includes("算法")
        ? "cream"
        : "outline";
  const map = {
    amber: "bg-[rgba(232,165,90,0.15)] text-[#a06820]",
    teal: "bg-[rgba(93,184,166,0.12)] text-[#2d7a6b]",
    cream: "bg-surface-card text-ink",
    outline: "bg-transparent text-muted border border-hairline",
  } as const;
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium",
        map[tone],
      )}
    >
      {type}
    </span>
  );
}

function Heatmap() {
  const weeks = 14;
  const days = 7;
  const cells: number[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const v = (Math.sin((w * days + d) * 7.13) + 1) / 2;
      cells.push(v < 0.3 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : 3);
    }
  }
  const palette = [
    "var(--color-surface-card)",
    "rgba(204,120,92,0.30)",
    "rgba(204,120,92,0.55)",
    "var(--color-primary)",
  ];
  return (
    <div className="bg-canvas border border-hairline rounded-xl px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[12px] font-medium tracking-[0.06em] uppercase text-muted">
          14 周作答热度
        </span>
        <div className="flex-1" />
        <span className="text-[11px] text-muted-soft">Less</span>
        {[0, 1, 2, 3].map((l) => (
          <span
            key={l}
            className="w-2.5 h-2.5 rounded-[2px]"
            style={{ background: palette[l] }}
          />
        ))}
        <span className="text-[11px] text-muted-soft">More</span>
      </div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}
      >
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: days }).map((_, d) => (
              <span
                key={d}
                className="block h-[14px] rounded-[2px]"
                style={{ background: palette[cells[w * days + d]] }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Predict ─────────────────────────────────────────────────────────

function PredictList({ items }: { items: PredictHistoryItem[] }) {
  return (
    <div className="grid gap-3.5 px-6 py-3">
      {items.map((s) => {
        const hitPct = (s.hit / s.total) * 100;
        const pendingPct = (s.pending / s.total) * 100;
        return (
          <div
            key={s.id}
            className="bg-canvas border border-hairline rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
          >
            <div>
              <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                <span
                  className="font-medium text-ink text-[22px] tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.title}
                </span>
                <span className="text-[12px] text-muted">· {s.date}</span>
              </div>
              <div className="font-mono text-[11px] text-muted-soft mb-3.5">
                {s.basis}
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-[12px] text-muted mr-1">高概率题：</span>
                {s.hottest.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-surface-card text-ink"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] font-medium tracking-[0.06em] uppercase text-muted">
                  命中
                </span>
                <span
                  className="font-medium text-ink text-[28px] tracking-[-0.02em]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.hit}
                  <span className="text-muted-soft text-[18px]"> / {s.total}</span>
                </span>
              </div>
              <div className="h-2 bg-surface-card rounded-full overflow-hidden flex">
                <div className="bg-primary" style={{ width: `${hitPct}%` }} />
                <div
                  style={{
                    width: `${pendingPct}%`,
                    background: "rgba(204,120,92,0.25)",
                  }}
                />
              </div>
              <div className="flex gap-3.5 text-[12px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary rounded-[2px]" />
                  命中 {s.hit}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-[2px]"
                    style={{ background: "rgba(204,120,92,0.25)" }}
                  />
                  待验证 {s.pending}
                </span>
              </div>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                <button className="bg-primary hover:bg-primary-active text-white text-[13px] font-medium px-4 py-2 rounded-md">
                  用作 /mock 题库
                </button>
                <button className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-4 py-2 rounded-md hover:bg-surface-card">
                  查看全部
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Optimize ────────────────────────────────────────────────────────

function OptimizeList({ items }: { items: OptimizeHistoryItem[] }) {
  return (
    <div className="grid gap-3.5 px-6 py-3">
      {items.map((it) => (
        <div
          key={it.id}
          className="bg-canvas border border-hairline rounded-xl p-5"
        >
          <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
            <Wand2 size={14} strokeWidth={1.8} className="text-primary" />
            <span className="text-[14px] text-ink font-medium">{it.q}</span>
            <div className="flex-1" />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-primary text-white">
              {it.tag}
            </span>
            <span className="text-[12px] text-muted">{it.date}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-surface-soft border border-hairline-soft rounded-lg p-3.5">
              <div className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-muted mb-2">
                Before · 草稿
              </div>
              <div className="text-[13px] text-muted leading-[1.6] line-through decoration-[rgba(108,106,100,0.35)]">
                {it.before}
              </div>
            </div>
            <div className="bg-surface-dark text-on-dark rounded-lg p-3.5">
              <div className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-accent-amber mb-2">
                After · OC 改写
              </div>
              <div
                className="text-[15px] leading-[1.55] tracking-[-0.005em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {it.after}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
