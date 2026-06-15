"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import clsx from "clsx";
import type {
  MessagePayload,
  OptimizeDiffPayload,
  PracticeQuestionPayload,
  PredictSessionPayload,
  ReviewFeedbackPayload,
} from "@/lib/messages";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n/use-t";
import type { Messages } from "@/lib/i18n/messages";
import { copyText, downloadText, safeFilename } from "@/lib/export";

/** Button with brief "✓ 已 X" feedback after click. */
function ActionButton({
  label,
  doneLabel,
  variant = "secondary",
  onAct,
}: {
  label: string;
  doneLabel?: string;
  variant?: "primary" | "secondary";
  onAct: () => unknown | Promise<unknown>;
}) {
  const [done, setDone] = useState(false);
  const cls =
    variant === "primary"
      ? "bg-primary hover:bg-primary-active text-white"
      : "bg-canvas text-ink border border-hairline hover:bg-surface-card";
  return (
    <button
      onClick={async () => {
        await onAct();
        if (doneLabel) {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        }
      }}
      className={clsx("text-[13px] font-medium px-4 py-2 rounded-md transition-colors", cls)}
    >
      {done && doneLabel ? doneLabel : label}
    </button>
  );
}

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
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);
  const pushToast = useAppStore((s) => s.pushToast);
  const t = useT();
  const hasSummary = data.summary.trim().length > 0;
  const hasScores = data.scores.length > 0;
  const hasStrengths = data.strengths.length > 0;
  const hasImprovements = data.improvements.length > 0;
  const hasRewrite = data.rewrite.text.trim().length > 0;
  const isComplete = hasSummary && hasScores && hasRewrite;
  return (
    <div className="space-y-4 mt-3">
      {hasScores ? (
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
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-surface-soft px-4 py-3.5 flex items-center justify-center min-h-[78px]">
              <Dots tone="muted" />
            </div>
          ))}
        </div>
      )}
      {hasSummary ? (
        <p className="text-[15px] text-body-strong leading-[1.65] whitespace-pre-wrap">
          {data.summary}
        </p>
      ) : (
        <div className="bg-surface-soft border border-hairline-soft rounded-md px-4 py-3">
          <Dots tone="muted" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ColumnCard
          dotClass="bg-success"
          label={t.modeCards.strengths}
          items={data.strengths}
          icon={<Check size={13} strokeWidth={2} className="text-success" />}
          pending={!hasStrengths}
        />
        <ColumnCard
          dotClass="bg-primary"
          label={t.modeCards.improvements}
          items={data.improvements}
          icon={<ArrowRight size={13} strokeWidth={2} className="text-primary" />}
          pending={!hasImprovements}
        />
      </div>
      <div className="bg-surface-dark text-on-dark rounded-xl px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} strokeWidth={1.8} className="text-accent-amber" />
          <span className="text-[12px] uppercase tracking-[0.06em] font-medium text-on-dark">
            {t.modeCards.suggestedRewrite}
          </span>
          <div className="flex-1" />
          {data.rewrite.tag && (
            <span className="font-mono text-[11px] text-on-dark-soft">
              {data.rewrite.tag}
            </span>
          )}
        </div>
        {hasRewrite ? (
          <p
            className="text-[18px] leading-[1.5] tracking-[-0.005em] m-0 whitespace-pre-wrap"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {data.rewrite.text}
          </p>
        ) : (
          <Dots tone="on-dark" />
        )}
      </div>
      {isComplete && (
        <div className="flex gap-2 flex-wrap">
          <ActionButton
            variant="primary"
            label={t.modeCards.continueNext}
            onAct={() => sendUserMessage(t.modeCards.continueNextSend)}
          />
          <ActionButton
            label={t.modeCards.exportReview}
            doneLabel={t.common.downloaded}
            onAct={() => downloadText("review-report.md", buildReviewMarkdown(data, t))}
          />
          <ActionButton
            label={t.modeCards.saveToProfile}
            onAct={() => {
              pushToast(t.modeCards.savedToProfile(data.rewrite.tag), "success");
            }}
          />
        </div>
      )}
    </div>
  );
}

function buildReviewMarkdown(d: ReviewFeedbackPayload, t: Messages): string {
  const m = t.md;
  const scores = d.scores
    .map((s) => `- **${s.label}**：${s.grade} · ${s.tone}`)
    .join("\n");
  const strengths = d.strengths.map((s) => `- ${s}`).join("\n");
  const improvements = d.improvements.map((s) => `- ${s}`).join("\n");
  return `# ${m.reviewTitle}

## ${m.reviewOverall}

${d.summary}

## ${m.reviewScores}

${scores}

## ${m.reviewStrengths}

${strengths}

## ${m.reviewImprovements}

${improvements}

## ${m.reviewRewrite} · ${d.rewrite.tag}

> ${d.rewrite.text}
`;
}

function ColumnCard({
  dotClass,
  label,
  items,
  icon,
  pending,
}: {
  dotClass: string;
  label: string;
  items: string[];
  icon: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <div className="bg-canvas border border-hairline rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className={clsx("w-1.5 h-1.5 rounded-full", dotClass)} />
        <span className="text-[12px] font-medium tracking-[0.06em] uppercase text-body">
          {label}
        </span>
      </div>
      {pending ? (
        <Dots tone="muted" />
      ) : (
        <div className="space-y-1.5">
          {items.map((s, i) => (
            <div key={i} className="flex gap-2 text-[13px] text-body leading-[1.55]">
              <span className="shrink-0 mt-0.5">{icon}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Practice ────────────────────────────────────────────────────────

function PracticeQuestionCard({ data }: { data: PracticeQuestionPayload }) {
  const t = useT();
  const hasTitle = data.title.trim().length > 0;
  const hasBody = data.body.trim().length > 0;
  const hasAnyChip = !!(data.category || data.difficulty || data.estimated || data.track);
  return (
    <div className="bg-surface-card rounded-2xl p-6 mt-3">
      {hasAnyChip && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {data.category && <Pill tone="amber">{data.category}</Pill>}
          {data.difficulty && <Pill tone="outline">{data.difficulty}</Pill>}
          {data.estimated && <Pill tone="outline">{data.estimated}</Pill>}
          {data.track && <Pill tone="outline">{data.track}</Pill>}
        </div>
      )}
      <h2
        className="font-medium m-0 mb-3 text-[24px] sm:text-[28px] leading-[1.2] tracking-[-0.02em]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {hasTitle ? (
          <span className="text-ink">{data.title}</span>
        ) : (
          <span className="text-muted-soft">{t.modeCards.drawingQuestion}</span>
        )}
      </h2>
      {hasBody ? (
        <p className="text-[15px] text-body leading-[1.65] m-0 mb-4 whitespace-pre-wrap">
          {data.body}
        </p>
      ) : (
        <div className="mb-4">
          <Dots tone="muted" />
        </div>
      )}
      {data.criteria && (
        <div className="pt-4 border-t border-hairline text-[12px] text-muted flex items-center gap-2">
          <span>👀</span>
          <span>{data.criteria}</span>
        </div>
      )}
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
  const activateChatMode = useAppStore((s) => s.activateChatMode);
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);
  const t = useT();
  const hasContext = data.context.trim().length > 0;
  const hasHottest = data.hottest.length > 0;
  const hasQuestions = data.questions.length > 0;
  const total = Math.max(data.total, data.questions.length, 1);
  const isComplete = hasQuestions;
  return (
    <div className="mt-3 space-y-3">
      <div className="bg-canvas border border-hairline rounded-xl p-5">
        {hasContext ? (
          <div className="font-mono text-[11px] text-muted-soft mb-3">{data.context}</div>
        ) : (
          <div className="mb-3">
            <Dots tone="muted" />
          </div>
        )}
        {hasHottest && (
          <div className="flex gap-1.5 flex-wrap items-center mb-4">
            <span className="text-[12px] text-muted mr-1">{t.modeCards.hottest}</span>
            {data.hottest.map((h) => (
              <Pill key={h} tone="cream">
                {h}
              </Pill>
            ))}
          </div>
        )}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[12px] uppercase tracking-[0.06em] font-medium text-muted">
            {t.modeCards.generated}
          </span>
          <span
            className="text-[28px] font-medium tracking-[-0.02em] text-ink"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {data.questions.length}
            <span className="text-muted-soft text-[18px]"> / {total}</span>
          </span>
        </div>
        <div className="h-2 bg-surface-card rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${(data.questions.length / total) * 100}%` }}
          />
        </div>
      </div>
      {hasQuestions ? (
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
                    {(q.prob * 100).toFixed(0)}% {t.modeCards.hitProb}
                  </span>
                </div>
              </div>
              <ProbBar pct={q.prob * 100} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-canvas border border-hairline rounded-xl px-4 py-6 flex items-center justify-center">
          <Dots tone="muted" />
        </div>
      )}
      {isComplete && (
        <div className="flex gap-2 flex-wrap">
          <ActionButton
            variant="primary"
            label={t.modeCards.useAsMock}
            onAct={() => {
              activateChatMode("mock");
              const list = data.questions
                .slice(0, 5)
                .map((q, i) => `${i + 1}. ${q.q}`)
                .join("\n");
              sendUserMessage(t.modeCards.mockSend(list));
            }}
          />
          <ActionButton
            label={t.modeCards.exportMarkdown}
            doneLabel={t.common.downloaded}
            onAct={() => downloadText("predict-session.md", buildPredictMarkdown(data, t))}
          />
        </div>
      )}
    </div>
  );
}

function buildPredictMarkdown(d: PredictSessionPayload, t: Messages): string {
  const m = t.md;
  const list = d.questions
    .map(
      (q, i) =>
        `${(i + 1).toString().padStart(2, "0")}. **${q.q}**\n   - ${m.predictType} ${q.category}\n   - ${m.predictProb} ${(q.prob * 100).toFixed(0)}%`,
    )
    .join("\n\n");
  return `# ${m.predictTitle}

**${m.predictContext}** ${d.context}

**${m.predictHottest}** ${d.hottest.join("、")}

**${m.predictGenerated(d.questions.length, d.total)}**

---

${list}
`;
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
  const sendUserMessage = useAppStore((s) => s.sendUserMessage);
  const t = useT();
  const beforeReady = data.before.trim().length > 0;
  const afterReady = data.after.trim().length > 0;
  const isComplete = beforeReady && afterReady;
  return (
    <div className="mt-3 bg-canvas border border-hairline rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <Sparkles size={14} strokeWidth={1.8} className="text-primary" />
        <span className="text-sm font-medium text-ink">
          {data.question || (
            <span className="text-muted-soft">{t.modeCards.identifyingProblem}</span>
          )}
        </span>
        <div className="flex-1" />
        {data.tag && <Pill tone="coral">{data.tag}</Pill>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-surface-soft border border-hairline-soft rounded-lg p-4">
          <div className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-muted mb-2">
            {t.modeCards.beforeLabel}
          </div>
          {beforeReady ? (
            <div className="text-[13px] text-muted leading-[1.6] line-through decoration-[rgba(108,106,100,0.35)] whitespace-pre-wrap">
              {data.before}
            </div>
          ) : (
            <Dots tone="muted" />
          )}
        </div>
        <div className="bg-surface-dark text-on-dark rounded-lg p-4">
          <div className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-accent-amber mb-2">
            {t.modeCards.afterLabel}
          </div>
          {afterReady ? (
            <div
              className="text-[15px] leading-[1.55] tracking-[-0.005em] whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {data.after}
            </div>
          ) : (
            <Dots tone="on-dark" />
          )}
        </div>
      </div>
      {isComplete && (
        <div className="flex gap-2 mt-4 flex-wrap">
          <ActionButton
            variant="primary"
            label={t.modeCards.adopt}
            doneLabel={t.common.copiedShort}
            onAct={() => copyText(data.after)}
          />
          <ActionButton
            label={t.modeCards.anotherVersion}
            onAct={() => sendUserMessage(t.modeCards.anotherVersionSend)}
          />
          <ActionButton
            label={t.modeCards.exportMarkdown}
            doneLabel={t.common.downloaded}
            onAct={() =>
              downloadText(
                `${safeFilename(data.question)}.md`,
                buildOptimizeMarkdown(data, t),
              )
            }
          />
        </div>
      )}
    </div>
  );
}

function Dots({ tone }: { tone: "muted" | "on-dark" }) {
  const dotCls = tone === "on-dark" ? "bg-on-dark-soft" : "bg-muted";
  return (
    <div className="flex items-center gap-1.5 py-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={clsx("w-1.5 h-1.5 rounded-full animate-pulse-soft", dotCls)}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function buildOptimizeMarkdown(d: OptimizeDiffPayload, t: Messages): string {
  const m = t.md;
  return `# ${m.optimizeTitle} · ${d.tag}

**${m.optimizeQuestion}** ${d.question}

## ${m.optimizeBefore}

${d.before}

## ${m.optimizeAfter}

${d.after}
`;
}
