import type { ModeId } from "./commands";
import type { HeadlineSegment, Messages } from "./i18n/messages";

export type { HeadlineSegment };
export type StatBadge = { v: string; label: string; color?: "primary" };

export type HistoryMeta = {
  headline: HeadlineSegment[];
  stats: StatBadge[];
  filters: string[];
};

export function buildHistoryMeta(
  mode: Exclude<ModeId, "chat">,
  count: number,
  m: Messages,
): HistoryMeta {
  const h = m.history;
  if (count === 0) {
    return {
      headline: [h.empty[mode]],
      stats: [],
      filters: [h.all],
    };
  }
  return {
    headline: h.headline[mode](String(count)),
    stats: [{ v: String(count), label: h.recordsStat }],
    filters: [h.all],
  };
}
