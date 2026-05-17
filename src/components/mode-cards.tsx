"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import clsx from "clsx";
import type {
  MessagePayload,
  OptimizeDiffPayload,
  PracticeQuestionPayload,
  PredictSessionPayload,
  ReviewFeedbackPayload,
} from "@/lib/messages";

export function ModeCard({ payload }: { payload: MessagePayload }) {
  switch (payload.kind) {
    case "review_feedback":
      return <ReviewFeedbackCard data={payload} />;
    case "practice_question":
      return <PracticeQuestionCard data={payload} />;
    case "predict_session":
      return <PredictSessionCard data={payload} />;
    case "optimize_diff":
      return <OptimizeDiffCard data={payload} />;
  }
}

// ─── Review ──────────────────────────────────────────────────────────

const SCORE_STYLES: Record<
  ReviewFeedbackPayload["scores"][number]["intent"],
  { bg: string; color: string }
> = {
  good: { bg: "bg-[rgba(93,184,166,0.12)]", color: "text-[#2d7a6b]" },
  warn: { bg: "bg-[rgba(232,165,90,0.15)]", color: "text-[#a06820]" },
  bad: { bg: "bg-[rgba(198,69,69,0.10)]", color: "text-[#a44]" },
  neutral: { bg: "bg-surface-card", color: "text-ink" },
};

function ReviewFeedbackCard({ data }: { data: ReviewFeedbackPayload }) {
  return (
    <div className="space-y-4 mt-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {data.scores.map((s) => {
          const style = SCORE_STYLES[s.intent];
          return (
            <div key={s.label} className={clsx("rounded-xl px-4 py-3.5", style.bg)}>
              <div
                className={clsx(
                  "text-[28px] leading-none font-medium tracking-[-0.02em]",
                  style.color,
                )}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {s.grade}
              </div>
              <div className="text-[12px] text-muted mt-1">{s.label}</div>
              <div className={clsx("text-[12px] mt-0.5 font-medium", style.color)}>
                {s.tone}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[15px] text-body-strong leading-[1.65]">{data.summary}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ColumnCard
          dotClass="bg-success"
          label="做得好的"
          items={data.strengths}
          icon={<Check size={13} strokeWidth={2} className="text-success" />}
        />
        <ColumnCard
          dotClass="bg-primary"
          label="下次试试"
          items={data.improvements}
          icon={<ArrowRight size={13} strokeWidth={2} className="text-primary" />}
        />
      </div>
      <div className="bg-surface-dark text-on-dark rounded-xl px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} strokeWidth={1.8} className="text-accent-amber" />
          <span className="text-[12px] uppercase tracking-[0.06em] font-medium text-on-dark">
            建议改写 · Task 段落
          </span>
          <div className="flex-1" />
          <span className="font-mono text-[11px] text-on-dark-soft">{data.rewrite.tag}</span>
        </div>
        <p
          className="text-[18px] leading-[1.5] tracking-[-0.005em] m-0"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {data.rewrite.text}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="bg-primary hover:bg-primary-active text-white text-[13px] font-medium px-4 py-2 rounded-md">
          继续改下一段
        </button>
        <button className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-4 py-2 rounded-md hover:bg-surface-card">
          导出复盘报告
        </button>
        <button className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-4 py-2 rounded-md hover:bg-surface-card">
          把要点存入画像
        </button>
      </div>
    </div>
  );
}

function ColumnCard({
  dotClass,
  label,
  items,
  icon,
}: {
  dotClass: string;
  label: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className={clsx("w-1.5 h-1.5 rounded-full", dotClass)} />
        <span className="text-[12px] font-medium tracking-[0.06em] uppercase text-body">
          {label}
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map((s, i) => (
          <div key={i} className="flex gap-2 text-[13px] text-body leading-[1.55]">
            <span className="shrink-0 mt-0.5">{icon}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Practice ────────────────────────────────────────────────────────

function PracticeQuestionCard({ data }: { data: PracticeQuestionPayload }) {
  return (
    <div className="bg-surface-card rounded-2xl p-6 mt-3">
      <div className="flex gap-2 mb-4 flex-wrap">
        <Pill tone="amber">{data.category}</Pill>
        <Pill tone="outline">{data.difficulty}</Pill>
        <Pill tone="outline">{data.estimated}</Pill>
        <Pill tone="outline">{data.track}</Pill>
      </div>
      <h2
        className="font-medium text-ink m-0 mb-3 text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {data.title}
      </h2>
      <p className="text-[15px] text-body leading-[1.65] m-0 mb-4">{data.body}</p>
      <div className="pt-4 border-t border-hairline text-[12px] text-muted flex items-center gap-2">
        <span>👀</span>
        <span>{data.criteria}</span>
      </div>
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "outline" | "cream" | "teal" | "coral";
}) {
  const map: Record<typeof tone, string> = {
    cream: "bg-surface-card text-ink",
    coral: "bg-primary text-white",
    outline: "bg-transparent text-muted border border-hairline",
    teal: "bg-[rgba(93,184,166,0.12)] text-[#2d7a6b]",
    amber: "bg-[rgba(232,165,90,0.15)] text-[#a06820]",
  } as const;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

// ─── Predict ─────────────────────────────────────────────────────────

function PredictSessionCard({ data }: { data: PredictSessionPayload }) {
  return (
    <div className="mt-3 space-y-3">
      <div className="bg-canvas border border-hairline rounded-xl p-5">
        <div className="font-mono text-[11px] text-muted-soft mb-3">{data.context}</div>
        <div className="flex gap-1.5 flex-wrap items-center mb-4">
          <span className="text-[12px] text-muted mr-1">高概率题：</span>
          {data.hottest.map((h) => (
            <Pill key={h} tone="cream">
              {h}
            </Pill>
          ))}
        </div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[12px] uppercase tracking-[0.06em] font-medium text-muted">
            生成
          </span>
          <span
            className="text-[28px] font-medium tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {data.questions.length}
            <span className="text-muted-soft text-[18px]"> / {data.total}</span>
          </span>
        </div>
        <div className="h-2 bg-surface-card rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${(data.questions.length / data.total) * 100}%` }}
          />
        </div>
      </div>
      <div className="bg-canvas border border-hairline rounded-xl overflow-hidden">
        {data.questions.map((q, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3 border-b border-hairline-soft last:border-b-0"
          >
            <span className="font-mono text-[11px] text-muted-soft min-w-[24px] pt-1">
              #{(i + 1).toString().padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-ink leading-[1.5]">{q.q}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <Pill tone="outline">{q.category}</Pill>
                <span className="font-mono text-[11px] text-muted">
                  {(q.prob * 100).toFixed(0)}% 命中概率
                </span>
              </div>
            </div>
            <ProbBar pct={q.prob * 100} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="bg-primary hover:bg-primary-active text-white text-[13px] font-medium px-4 py-2 rounded-md">
          用作 /mock 题库
        </button>
        <button className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-4 py-2 rounded-md hover:bg-surface-card">
          导出 Markdown
        </button>
      </div>
    </div>
  );
}

function ProbBar({ pct }: { pct: number }) {
  return (
    <div className="w-12 shrink-0 flex flex-col items-end gap-1 pt-1">
      <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Optimize ────────────────────────────────────────────────────────

function OptimizeDiffCard({ data }: { data: OptimizeDiffPayload }) {
  return (
    <div className="mt-3 bg-canvas border border-hairline rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <Sparkles size={14} strokeWidth={1.8} className="text-primary" />
        <span className="text-sm font-medium text-ink">{data.question}</span>
        <div className="flex-1" />
        <Pill tone="coral">{data.tag}</Pill>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-surface-soft border border-hairline-soft rounded-lg p-4">
          <div className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-muted mb-2">
            Before · 草稿
          </div>
          <div className="text-[13px] text-muted leading-[1.6] line-through decoration-[rgba(108,106,100,0.35)]">
            {data.before}
          </div>
        </div>
        <div className="bg-surface-dark text-on-dark rounded-lg p-4">
          <div className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-accent-amber mb-2">
            After · OC 改写
          </div>
          <div
            className="text-[15px] leading-[1.55] tracking-[-0.005em]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {data.after}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button className="bg-primary hover:bg-primary-active text-white text-[13px] font-medium px-4 py-2 rounded-md">
          采纳此版本
        </button>
        <button className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-4 py-2 rounded-md hover:bg-surface-card">
          再来一版
        </button>
        <button className="bg-canvas text-ink border border-hairline text-[13px] font-medium px-4 py-2 rounded-md hover:bg-surface-card">
          导出 Markdown
        </button>
      </div>
    </div>
  );
}
