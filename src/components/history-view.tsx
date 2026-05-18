"use client";

import { useEffect, useState } from "react";
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
import { useAppStore } from "@/lib/store";
import { HistoryShell } from "./history-shell";

export function HistoryView({ mode }: { mode: Exclude<ModeId, "chat"> }) {
  const meta = HISTORY_META[mode];
  const [filter, setFilter] = useState<string>("全部");
  const [search, setSearch] = useState("");

  // Reset filter / search when switching mode (chips differ per mode).
  useEffect(() => {
    setFilter("全部");
    setSearch("");
  }, [mode]);

  const q = search.trim().toLowerCase();
  const mock = HISTORY_STUB.mock.filter((it) => mockMatches(it, filter, q));
  const review = HISTORY_STUB.review.filter((it) => reviewMatches(it, filter, q));
  const practice = HISTORY_STUB.practice.filter((it) => practiceMatches(it, filter, q));
  const predict = HISTORY_STUB.predict.filter((it) => predictMatches(it, filter, q));
  const optimize = HISTORY_STUB.optimize.filter((it) => optimizeMatches(it, filter, q));

  return (
    <HistoryShell
      mode={mode}
      meta={meta}
      activeFilter={filter}
      onSelectFilter={setFilter}
      search={search}
      onSearchChange={setSearch}
    >
      {mode === "mock" && <MockList items={mock} empty={emptyMsg(mock.length, q)} />}
      {mode === "review" && <ReviewList items={review} empty={emptyMsg(review.length, q)} />}
      {mode === "practice" && (
        <PracticeList items={practice} empty={emptyMsg(practice.length, q)} />
      )}
      {mode === "predict" && (
        <PredictList items={predict} empty={emptyMsg(predict.length, q)} />
      )}
      {mode === "optimize" && (
        <OptimizeList items={optimize} empty={emptyMsg(optimize.length, q)} />
      )}
    </HistoryShell>
  );
}

function emptyMsg(count: number, q: string): string | null {
  if (count > 0) return null;
  return q ? `没有匹配「${q}」的记录` : "当前筛选下还没有记录";
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="text-center text-[13px] text-muted-soft py-16">{msg}</div>
  );
}

// ─── Match helpers ───────────────────────────────────────────────────

function searchMatch(text: string, q: string): boolean {
  if (!q) return true;
  return text.toLowerCase().includes(q);
}

function mockMatches(it: MockHistoryItem, filter: string, q: string): boolean {
  if (!searchMatch(`${it.co} ${it.role} ${it.round}`, q)) return false;
  if (filter === "全部") return true;
  if (filter === "其它") return !["Google", "字节", "Stripe"].includes(it.co);
  return it.co === filter;
}

function reviewMatches(it: ReviewHistoryItem, filter: string, q: string): boolean {
  if (!searchMatch(`${it.co} ${it.round} ${it.source} ${it.top}`, q)) return false;
  if (filter === "全部") return true;
  if (filter === "其它") {
    return !["行为", "系统设计", "项目深挖"].some((k) => it.round.includes(k));
  }
  const map: Record<string, string> = {
    行为面: "行为",
    系统设计: "系统设计",
    项目深挖: "项目深挖",
  };
  const needle = map[filter] ?? filter;
  return it.round.includes(needle);
}

function practiceMatches(
  it: PracticeHistoryItem,
  filter: string,
  q: string,
): boolean {
  if (!searchMatch(`${it.q} ${it.type}`, q)) return false;
  if (filter === "全部") return true;
  if (filter === "需重做") return !it.rating.startsWith("A");
  return it.type.includes(filter);
}

function predictMatches(
  it: PredictHistoryItem,
  filter: string,
  q: string,
): boolean {
  const text = `${it.title} ${it.basis} ${it.hottest.join(" ")}`;
  if (!searchMatch(text, q)) return false;
  if (filter === "全部") return true;
  if (filter === "已用") return it.hit > 0;
  if (filter === "未验证") return it.pending > 0;
  if (filter === "失效") return it.hit === 0 && it.pending === 0;
  return true;
}

function optimizeMatches(
  it: OptimizeHistoryItem,
  filter: string,
  q: string,
): boolean {
  if (!searchMatch(`${it.q} ${it.before} ${it.after} ${it.tag}`, q)) return false;
  if (filter === "全部") return true;
  return it.tag.includes(filter);
}

// ─── Mock ────────────────────────────────────────────────────────────

function MockList({ items, empty }: { items: MockHistoryItem[]; empty: string | null }) {
  const load = useAppStore((s) => s.loadHistoryItem);
  if (empty) return <EmptyState msg={empty} />;
  return (
    <div>
      {items.map((m) => (
        <button
          key={m.id}
          onClick={() => load("mock", m.id)}
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

function ReviewList({
  items,
  empty,
}: {
  items: ReviewHistoryItem[];
  empty: string | null;
}) {
  const load = useAppStore((s) => s.loadHistoryItem);
  if (empty) return <EmptyState msg={empty} />;
  return (
    <div>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => load("review", it.id)}
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

function PracticeList({
  items,
  empty,
}: {
  items: PracticeHistoryItem[];
  empty: string | null;
}) {
  const load = useAppStore((s) => s.loadHistoryItem);
  return (
    <div>
      <div className="px-6 pb-2 pt-4">
        <Heatmap />
      </div>
      {empty ? (
        <EmptyState msg={empty} />
      ) : (
        items.map((it) => (
          <button
            key={it.id}
            onClick={() => load("practice", it.id)}
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
        ))
      )}
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

function PredictList({
  items,
  empty,
}: {
  items: PredictHistoryItem[];
  empty: string | null;
}) {
  const load = useAppStore((s) => s.loadHistoryItem);
  if (empty) return <EmptyState msg={empty} />;
  return (
    <div className="grid gap-3.5 px-6 py-3">
      {items.map((s) => {
        const hitPct = (s.hit / s.total) * 100;
        const pendingPct = (s.pending / s.total) * 100;
        return (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            onClick={() => load("predict", s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                load("predict", s.id);
              }
            }}
            className="bg-canvas border border-hairline rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 cursor-pointer hover:bg-surface-soft transition-colors"
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Optimize ────────────────────────────────────────────────────────

function OptimizeList({
  items,
  empty,
}: {
  items: OptimizeHistoryItem[];
  empty: string | null;
}) {
  const load = useAppStore((s) => s.loadHistoryItem);
  if (empty) return <EmptyState msg={empty} />;
  return (
    <div className="grid gap-3.5 px-6 py-3">
      {items.map((it) => (
        <div
          key={it.id}
          role="button"
          tabIndex={0}
          onClick={() => load("optimize", it.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              load("optimize", it.id);
            }
          }}
          className="bg-canvas border border-hairline rounded-xl p-5 cursor-pointer hover:bg-surface-soft transition-colors"
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
