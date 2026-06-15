import { tt } from "./i18n/runtime";

export function formatRelativeDate(ts: number, now: number = Date.now()): string {
  const d = new Date(ts);
  const today = new Date(now);
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(today) - startOfDay(d)) / 86400_000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dt = tt().date;
  if (dayDiff === 0) return dt.today(`${hh}:${mm}`);
  if (dayDiff === 1) return dt.yesterday(`${hh}:${mm}`);
  if (dayDiff < 7) return dt.daysAgo(dayDiff);
  if (d.getFullYear() === today.getFullYear()) {
    return dt.monthDay(d.getMonth() + 1, d.getDate());
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
