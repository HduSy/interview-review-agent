export function formatRelativeDate(ts: number, now: number = Date.now()): string {
  const d = new Date(ts);
  const today = new Date(now);
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(today) - startOfDay(d)) / 86400_000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (dayDiff === 0) return `今天 ${hh}:${mm}`;
  if (dayDiff === 1) return `昨天 ${hh}:${mm}`;
  if (dayDiff < 7) return `${dayDiff} 天前`;
  if (d.getFullYear() === today.getFullYear()) {
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
