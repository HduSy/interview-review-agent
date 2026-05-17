import type { ModeId } from "./commands";

export type HistoryItem = {
  id: string;
  title: string;
  sub?: string;
  date: string;
  meta?: string;
  badge?: string;
  accent?: string;
};

export const HISTORY_STUB: Record<Exclude<ModeId, "chat">, HistoryItem[]> = {
  mock: [
    { id: "m1", title: "Google", sub: "Senior Frontend", date: "今天 14:02", meta: "48 min", badge: "B+", accent: "#4285F4" },
    { id: "m2", title: "字节", sub: "Frontend SR · R1 行为面", date: "昨天 21:10", meta: "32 min", badge: "A−", accent: "#181715" },
    { id: "m3", title: "Stripe", sub: "Product Engineer · Onsite Coding", date: "5 月 12 日", meta: "65 min", badge: "B", accent: "#635bff" },
    { id: "m4", title: "Linear", sub: "Frontend Engineer · R1 项目深挖", date: "5 月 9 日", meta: "41 min", badge: "A", accent: "#5e6ad2" },
    { id: "m5", title: "Anthropic", sub: "Product Engineer · Take-home 复盘", date: "5 月 7 日", meta: "55 min", badge: "B+", accent: "#cc785c" },
  ],
  review: [
    { id: "r1", title: "字节 · 抖音 · 二面 行为问题", sub: "STAR S/T/A/R 全维度", date: "昨天 20:30", badge: "B+" },
    { id: "r2", title: "Anthropic · 一面 项目深挖", sub: "系统设计偏弱 · 已记录", date: "5 月 11 日", badge: "B" },
    { id: "r3", title: "Stripe · Onsite 复盘合集", sub: "5 个 Round · 综合 A−", date: "5 月 8 日", badge: "A−" },
  ],
  practice: [
    { id: "p1", title: "百万行前端表格设计", sub: "系统设计 · 中等", date: "今天 09:15", meta: "12 min", badge: "Pass" },
    { id: "p2", title: "Promise 实现 + then 调度", sub: "JavaScript · 困难", date: "昨天 22:40", meta: "18 min", badge: "Pass" },
    { id: "p3", title: "讲一个推动跨团队协作的故事", sub: "行为面 · 中等", date: "5 月 14 日", meta: "9 min", badge: "Retry" },
    { id: "p4", title: "React 并发渲染心智模型", sub: "前端框架 · 中等", date: "5 月 13 日", meta: "11 min", badge: "Pass" },
  ],
  predict: [
    { id: "f1", title: "Google · L5 Frontend · 预测题集", sub: "12 题 · 已用 9 道", date: "5 月 15 日", badge: "命中 7" },
    { id: "f2", title: "Anthropic · Product Eng · 预测题集", sub: "10 题 · 未启用", date: "5 月 9 日", badge: "新" },
  ],
  optimize: [
    { id: "o1", title: '"最难的一次跨团队协作"', sub: "STAR T/R 段重写", date: "今天 11:24", badge: "v3" },
    { id: "o2", title: '"为什么离开上家公司"', sub: "情绪表达优化", date: "5 月 12 日", badge: "v2" },
    { id: "o3", title: '"你认为 React 最大的优势"', sub: "深度 + 落地案例", date: "5 月 6 日", badge: "v4" },
    { id: "o4", title: '"五年规划"', sub: "把口语化打磨成结构化", date: "5 月 4 日", badge: "v2" },
    { id: "o5", title: '"你最骄傲的项目"', sub: "突出 ownership + 量化", date: "4 月 28 日", badge: "v3" },
    { id: "o6", title: '"如何处理冲突"', sub: "STAR + 反思", date: "4 月 25 日", badge: "v1" },
    { id: "o7", title: '"为什么选我们"', sub: "公司调研落地", date: "4 月 22 日", badge: "v2" },
  ],
};

export const MODE_META: Record<Exclude<ModeId, "chat">, { headline: string; unit: string; metric: string }> = {
  mock: { headline: "你练了 {n} 场模拟面试。", unit: "场", metric: "241 min · 34 题 · 平均 B+" },
  review: { headline: "你复盘了 {n} 段面试记录。", unit: "段", metric: "总共 12,840 字 · 平均反馈 B" },
  practice: { headline: "你做了 {n} 道随堂练习。", unit: "题", metric: "通过率 78% · 连续 12 天" },
  predict: { headline: "你生成了 {n} 套预测题。", unit: "套", metric: "累计命中 7 / 22 题" },
  optimize: { headline: "你优化了 {n} 段答案。", unit: "段", metric: "平均迭代 2.4 次 · 最高 v4" },
};
