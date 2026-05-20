import type { ModeId } from "./commands";

export type HeadlineSegment = string | { primary: string };
export type StatBadge = { v: string; label: string; color?: "primary" };

export type HistoryMeta = {
  headline: HeadlineSegment[];
  stats: StatBadge[];
  filters: string[];
};

const HEADLINE_TEMPLATES: Record<Exclude<ModeId, "chat">, [string, string]> = {
  mock: ["你练了 ", " 场模拟面试。"],
  review: ["你复盘过 ", " 场面试。"],
  practice: ["你答了 ", " 题。"],
  predict: ["你做过 ", " 组预测。"],
  optimize: ["优化了 ", " 个答案。"],
};

const EMPTY_HEADLINE: Record<Exclude<ModeId, "chat">, string> = {
  mock: "还没有模拟过 — 试一次？",
  review: "还没有复盘记录 — 粘一段面试记录开始。",
  practice: "还没答题 — 让我出一道。",
  predict: "还没有预测过 — 告诉我目标公司。",
  optimize: "还没有优化过答案 — 贴一段试试。",
};

export function buildHistoryMeta(
  mode: Exclude<ModeId, "chat">,
  count: number,
): HistoryMeta {
  if (count === 0) {
    return {
      headline: [EMPTY_HEADLINE[mode]],
      stats: [],
      filters: ["全部"],
    };
  }
  const [prefix, suffix] = HEADLINE_TEMPLATES[mode];
  return {
    headline: [prefix, { primary: String(count) }, suffix],
    stats: [{ v: String(count), label: "条记录" }],
    filters: ["全部"],
  };
}
