import type { ModeId } from "./commands";

type ItemBase = { id: string; date: string };

export type MockHistoryItem = ItemBase & {
  kind: "mock";
  co: string;
  role: string;
  round: string;
  duration: string;
  grade: string;
  accent?: string;
};

export type ReviewHistoryItem = ItemBase & {
  kind: "review";
  co: string;
  round: string;
  source: string;
  /** STAR 四段完成度 0–100 */
  star: [number, number, number, number];
  top: string;
};

export type PracticeHistoryItem = ItemBase & {
  kind: "practice";
  n: number;
  q: string;
  type: string;
  duration: string;
  rating: string;
};

export type PredictHistoryItem = ItemBase & {
  kind: "predict";
  title: string;
  basis: string;
  total: number;
  hit: number;
  pending: number;
  hottest: string[];
};

export type OptimizeHistoryItem = ItemBase & {
  kind: "optimize";
  q: string;
  before: string;
  after: string;
  tag: string;
};

export type HistoryItem =
  | MockHistoryItem
  | ReviewHistoryItem
  | PracticeHistoryItem
  | PredictHistoryItem
  | OptimizeHistoryItem;

export type HistoryByMode = {
  mock: MockHistoryItem[];
  review: ReviewHistoryItem[];
  practice: PracticeHistoryItem[];
  predict: PredictHistoryItem[];
  optimize: OptimizeHistoryItem[];
};

export const HISTORY_STUB: HistoryByMode = {
  mock: [
    { id: "m1", kind: "mock", co: "Google", role: "Senior Frontend", round: "R2 · 系统设计", date: "今天 14:02", duration: "48 min", grade: "B+", accent: "#4285F4" },
    { id: "m2", kind: "mock", co: "字节", role: "Frontend SR", round: "R1 · 行为面", date: "昨天 21:10", duration: "32 min", grade: "A−", accent: "#181715" },
    { id: "m3", kind: "mock", co: "Stripe", role: "Product Engineer", round: "Onsite · Coding", date: "5 月 12 日", duration: "65 min", grade: "B", accent: "#635bff" },
    { id: "m4", kind: "mock", co: "Linear", role: "Frontend Engineer", round: "R1 · 项目深挖", date: "5 月 9 日", duration: "41 min", grade: "A", accent: "#5e6ad2" },
    { id: "m5", kind: "mock", co: "Anthropic", role: "Product Engineer", round: "R2 · Take-home 复盘", date: "5 月 7 日", duration: "55 min", grade: "B+", accent: "#cc785c" },
  ],
  review: [
    { id: "r1", kind: "review", co: "字节抖音", round: "二面 · 行为", date: "今天 21:10", source: "手动粘贴 · 1,420 字", star: [100, 60, 50, 30], top: "Result 缺数据" },
    { id: "r2", kind: "review", co: "Stripe", round: "Onsite · 系统设计", date: "5 月 13 日", source: "导入语音转写", star: [100, 100, 90, 80], top: "整体扎实" },
    { id: "r3", kind: "review", co: "Google", round: "R2 · System Design", date: "5 月 10 日", source: "手动粘贴 · 2,100 字", star: [80, 100, 100, 70], top: "结尾仓促" },
    { id: "r4", kind: "review", co: "Linear", round: "R1 · 项目深挖", date: "5 月 8 日", source: "导入截图 · 8 张", star: [100, 80, 90, 90], top: "继续保持" },
    { id: "r5", kind: "review", co: "Anthropic", round: "Take-home 复盘", date: "5 月 5 日", source: "手动粘贴 · 980 字", star: [90, 90, 60, 40], top: "Action 太抽象" },
  ],
  practice: [
    { id: "p24", kind: "practice", n: 24, q: "设计一个支持百万行的前端表格组件", type: "系统设计", duration: "11:24", rating: "A−", date: "今天" },
    { id: "p23", kind: "practice", n: 23, q: "聊聊你最难的一次跨团队协作", type: "行为", duration: "06:12", rating: "B+", date: "今天" },
    { id: "p22", kind: "practice", n: 22, q: "实现 LRU 缓存，需要考虑并发安全", type: "算法 · 代码", duration: "18:45", rating: "B", date: "昨天" },
    { id: "p21", kind: "practice", n: 21, q: "React 中 useMemo 和 useCallback 的真正区别", type: "概念", duration: "04:30", rating: "A", date: "昨天" },
    { id: "p20", kind: "practice", n: 20, q: "如何设计前端的灰度发布机制", type: "系统设计", duration: "14:08", rating: "B+", date: "5/14" },
  ],
  predict: [
    {
      id: "f1",
      kind: "predict",
      title: "Google · Senior Frontend",
      basis: "JD: 招聘说明 · 1,820 字  +  简历: YuxinTao_Resume_2026.pdf",
      date: "今天 10:14",
      total: 12,
      hit: 4,
      pending: 8,
      hottest: ["React 渲染优化", "微前端跨应用通信", "TypeScript 高级类型"],
    },
    {
      id: "f2",
      kind: "predict",
      title: "字节抖音 · 前端 SR",
      basis: "JD: 内推贴 · 612 字  +  简历: 同上",
      date: "5 月 12 日",
      total: 8,
      hit: 6,
      pending: 2,
      hottest: ["埋点架构", "Babel/AST 工程化", "性能监控"],
    },
  ],
  optimize: [
    {
      id: "o1",
      kind: "optimize",
      q: "聊聊你最难的一次跨团队协作",
      before:
        "我们当时要推一个埋点规范，涉及 5 个业务线。我先去找了各业务的负责人聊…",
      after:
        "我作为埋点 owner，在 8 周内推动 5 条业务线接入统一规范，将数据口径不一致导致的客诉从每周 12 例降到 0…",
      tag: "STAR · T+R",
      date: "今天 16:20",
    },
    {
      id: "o2",
      kind: "optimize",
      q: "React 中 useMemo 和 useCallback 的真正区别",
      before:
        "useMemo 是缓存值，useCallback 是缓存函数。useCallback(fn, deps) = useMemo(() => fn, deps)。",
      after:
        "两者本质都是 useMemo —— useCallback 是 useMemo 的语法糖。真正决定要不要用的不是『值 vs 函数』，而是下游消费者是否依赖引用相等（React.memo、依赖数组）。如果下游不在乎引用，加这两个钩子就是负优化。",
      tag: "结构化 · 加论据",
      date: "昨天 23:01",
    },
  ],
};

export type StatBadge = { v: string; label: string; color?: "primary" };
export type HeadlineSegment = string | { primary: string };

export type RecentRef = {
  mode: Exclude<ModeId, "chat">;
  itemId: string;
  title: string;
};

export const RECENT_ITEMS: RecentRef[] = [
  { mode: "mock", itemId: "m1", title: "Google · Frontend SR · 模拟" },
  { mode: "review", itemId: "r1", title: "字节 抖音 · 二面行为复盘" },
  { mode: "optimize", itemId: "o2", title: "React useMemo/useCallback · 改写" },
  { mode: "predict", itemId: "f1", title: "Google · 预测题集 12 道" },
];

export type HistoryMeta = {
  headline: HeadlineSegment[];
  ctaLabel: string;
  stats: StatBadge[];
  filters: string[];
};

export const HISTORY_META: Record<Exclude<ModeId, "chat">, HistoryMeta> = {
  mock: {
    headline: ["你练了 ", { primary: "5" }, " 场模拟面试。"],
    ctaLabel: "开始新的模拟",
    stats: [
      { v: "241 min", label: "总时长" },
      { v: "34", label: "题数" },
      { v: "B+", label: "平均" },
      { v: "↗", label: "近三场表现持续上行", color: "primary" },
    ],
    filters: ["全部", "Google", "字节", "Stripe", "其它"],
  },
  review: {
    headline: ["你复盘过 ", { primary: "5" }, " 场面试。"],
    ctaLabel: "开始新的复盘",
    stats: [
      { v: "B+", label: "平均评级" },
      { v: "STAR · A", label: "完整度趋势" },
      { v: "12", label: "高频改进点" },
      { v: "↗", label: "近三场 Result 段提升", color: "primary" },
    ],
    filters: ["全部", "行为面", "系统设计", "项目深挖", "其它"],
  },
  practice: {
    headline: ["30 天答了 ", { primary: "24" }, " 题，连续 6 天。"],
    ctaLabel: "再来一题",
    stats: [
      { v: "24", label: "总题数" },
      { v: "6 天", label: "连胜" },
      { v: "B+", label: "平均评级" },
      { v: "系统设计 × 8", label: "最常练" },
    ],
    filters: ["全部", "系统设计", "行为", "算法", "概念", "需重做"],
  },
  predict: {
    headline: [
      "为你预测过 ",
      { primary: "4" },
      " 组题，命中 ",
      { primary: "14 / 28" },
      "。",
    ],
    ctaLabel: "生成新一组",
    stats: [
      { v: "4", label: "预测会话" },
      { v: "28", label: "题目总数" },
      { v: "50%", label: "命中率" },
      { v: "↗ Google 准度最高", label: "", color: "primary" },
    ],
    filters: ["全部", "已用", "未验证", "失效"],
  },
  optimize: {
    headline: ["优化了 ", { primary: "7" }, " 个答案。"],
    ctaLabel: "优化新答案",
    stats: [
      { v: "7", label: "已优化" },
      { v: "STAR ↑", label: "最常加强的维度" },
      { v: "+38%", label: "平均字数补全", color: "primary" },
    ],
    filters: ["全部", "STAR", "结构化", "加论据", "去口语化"],
  },
};
