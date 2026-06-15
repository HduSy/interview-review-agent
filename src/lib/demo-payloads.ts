import type {
  OptimizeDiffPayload,
  PracticeQuestionPayload,
  PredictSessionPayload,
  ReviewFeedbackPayload,
} from "./messages";
import type { Locale } from "./i18n/locale";
import { getActiveLocale } from "./i18n/runtime";

type DemoSet = {
  review: ReviewFeedbackPayload;
  practice: PracticeQuestionPayload;
  predict: PredictSessionPayload;
  optimize: OptimizeDiffPayload;
};

const ZH: DemoSet = {
  review: {
    kind: "review_feedback",
    summary:
      "整体回答很真诚、细节充实——尤其是 Situation 部分，把 5 个业务线的复杂度交代得很清晰。但 Task 段被你跳过了，面试官需要回过头去问；Result 完全没有量化指标——这在字节会被反复追问。",
    scores: [
      { label: "整体表现", grade: "B+", tone: "良好", intent: "neutral" },
      { label: "STAR 结构", grade: "S", tone: "完整", intent: "good" },
      { label: "T 任务定义", grade: "T", tone: "偏弱", intent: "warn" },
      { label: "结果量化", grade: "R", tone: "缺数据", intent: "bad" },
    ],
    strengths: [
      "背景铺陈到位、不流水账",
      "主动提到了 stakeholder mapping",
      "诚实承认了第一版方案的失败",
    ],
    improvements: [
      "开头 30 秒先把目标 / 约束讲明白",
      "把『我』的具体动作量化（推动了 N 次评审）",
      "结尾必须给数字：覆盖率、ROI、time-to-x",
    ],
    rewrite: {
      tag: "STAR · T",
      text: '"我作为埋点 owner，需要在 8 周内让 5 条业务线接入统一规范，目标是把数据口径不一致导致的客诉从每周 12 例降到 0—— 这意味着我既要交付一个不阻塞业务的迁移工具，又要拿到每条业务线 PM 的口头承诺。"',
    },
  },
  practice: {
    kind: "practice_question",
    category: "系统设计",
    difficulty: "中等",
    estimated: "预计 12 min",
    track: "前端",
    title: "设计一个支持百万行的前端表格组件",
    body:
      "客户场景：金融数据，单页 100w+ 行 × 40 列，需要支持排序 / 筛选 / 单元格编辑，编辑要乐观更新并能回滚。不允许后端分页（客户合规要求一次性下发）。",
    criteria: "评分维度：可扩展性 · 性能直觉 · 取舍说明 · 边界情况",
  },
  predict: {
    kind: "predict_session",
    context: "JD: 招聘说明 · 1,820 字  +  简历: YuxinTao_Resume_2026.pdf",
    hottest: ["React 渲染优化", "微前端跨应用通信", "TypeScript 高级类型"],
    total: 10,
    questions: [
      { q: "在大型 React 应用中，你如何定位并解决多余 re-render？", category: "前端框架", prob: 0.92 },
      { q: "微前端方案对比：qiankun / Module Federation / iframe 各自的破口在哪？", category: "工程化", prob: 0.85 },
      { q: "讲一个你用 TS 高级类型解决过的真实问题（不要 utility types 摘抄）", category: "TypeScript", prob: 0.78 },
      { q: "如何设计一个支持 100w 行的虚拟表格，写出关键 API？", category: "系统设计", prob: 0.74 },
      { q: "如果团队反对你引入 Server Components，你会怎么推进？", category: "影响力", prob: 0.62 },
      { q: "Web Vitals 三个指标里，你最常和哪个搏斗？给一个具体的优化案例。", category: "性能", prob: 0.55 },
      { q: "你最近一次 code review 让你印象深的是哪一次，为什么？", category: "协作", prob: 0.48 },
      { q: "讲一次你独立做技术选型，最后被打脸 / 被采纳的故事。", category: "决策", prob: 0.41 },
    ],
  },
  optimize: {
    kind: "optimize_diff",
    question: "聊聊你最难的一次跨团队协作",
    tag: "STAR · T+R",
    before:
      "我们当时要推一个埋点规范，涉及 5 个业务线。我先去找了各业务的负责人聊，大家都说有时间就支持，但实际推动还是挺难的，后来花了几个月慢慢推完了。",
    after: `我作为埋点 owner，在 8 周内推动 5 条业务线接入统一规范，把数据口径不一致导致的客诉从每周 12 例降到 0。最大的卡点是 PM 节奏不同步——我做了三件事：1) 给每条业务线写一份"对你的好处"白皮书；2) 把迁移工具拆成"不阻塞业务"的双轨方案；3) 每周固定 30 分钟 sync 同步进度。最终在第 7 周完成全部迁移，节省的客服工时折合 1.2 个人月 / 月。`,
  },
};

const EN: DemoSet = {
  review: {
    kind: "review_feedback",
    summary:
      "The answer is sincere and detailed — especially the Situation part, which lays out the complexity across 5 business lines clearly. But you skipped the Task section, so the interviewer has to circle back to ask; and the Result has no quantified metrics — that gets probed repeatedly at top companies.",
    scores: [
      { label: "Overall", grade: "B+", tone: "Solid", intent: "neutral" },
      { label: "STAR structure", grade: "S", tone: "Complete", intent: "good" },
      { label: "T (task)", grade: "T", tone: "Weak", intent: "warn" },
      { label: "Quantified result", grade: "R", tone: "No data", intent: "bad" },
    ],
    strengths: [
      "Context set up well, not a play-by-play",
      "Proactively mentioned stakeholder mapping",
      "Honestly admitted the first version failed",
    ],
    improvements: [
      "Spend the first 30s stating the goal / constraints",
      "Quantify what \"I\" did (drove N reviews)",
      "End with numbers: coverage, ROI, time-to-x",
    ],
    rewrite: {
      tag: "STAR · T",
      text: '"As the tracking owner, I had 8 weeks to get 5 business lines onto a unified spec — the goal was to cut customer complaints caused by inconsistent data definitions from 12/week to 0. That meant shipping a migration tool that didn\'t block the business, while securing a verbal commitment from each line\'s PM."',
    },
  },
  practice: {
    kind: "practice_question",
    category: "System design",
    difficulty: "Medium",
    estimated: "~12 min",
    track: "Frontend",
    title: "Design a frontend table component for millions of rows",
    body:
      "Client scenario: financial data, 1M+ rows × 40 columns on a single page, with sorting / filtering / cell editing; edits must be optimistic and reversible. Backend pagination is not allowed (compliance requires a one-shot delivery).",
    criteria: "Scored on: scalability · performance intuition · trade-off articulation · edge cases",
  },
  predict: {
    kind: "predict_session",
    context: "JD: posting · 1,820 words  +  Résumé: YuxinTao_Resume_2026.pdf",
    hottest: ["React render optimization", "Micro-frontend cross-app comms", "Advanced TypeScript types"],
    total: 10,
    questions: [
      { q: "In a large React app, how do you locate and fix redundant re-renders?", category: "Framework", prob: 0.92 },
      { q: "Compare micro-frontend approaches: qiankun / Module Federation / iframe — where does each break?", category: "Tooling", prob: 0.85 },
      { q: "Describe a real problem you solved with advanced TS types (no utility-type quoting).", category: "TypeScript", prob: 0.78 },
      { q: "How would you design a virtual table for 1M rows? Sketch the key API.", category: "System design", prob: 0.74 },
      { q: "If the team opposed introducing Server Components, how would you push it forward?", category: "Influence", prob: 0.62 },
      { q: "Of the three Web Vitals, which do you fight most? Give a concrete optimization case.", category: "Performance", prob: 0.55 },
      { q: "What's a recent code review that stuck with you, and why?", category: "Collaboration", prob: 0.48 },
      { q: "Tell a story of a tech choice you made solo that was later vindicated / backfired.", category: "Decisions", prob: 0.41 },
    ],
  },
  optimize: {
    kind: "optimize_diff",
    question: "Tell me about your hardest cross-team collaboration",
    tag: "STAR · T+R",
    before:
      "We had to roll out a tracking spec across 5 business lines. I first talked to each line's lead; everyone said they'd help when they had time, but driving it was actually hard, and it took a few months to finish.",
    after: `As the tracking owner, I drove 5 business lines onto a unified spec in 8 weeks, cutting customer complaints from inconsistent data definitions from 12/week to 0. The biggest blocker was PMs being out of sync — I did three things: 1) wrote a "what's in it for you" one-pager per line; 2) split the migration tool into a dual-track, non-blocking plan; 3) ran a fixed 30-min weekly sync. All migrations finished in week 7, saving ~1.2 person-months of support time per month.`,
  },
};

const DEMO: Record<Locale, DemoSet> = { zh: ZH, en: EN };

/** Demo payloads for the active locale (no-API-key showcase path). */
export function demoPayloads(): DemoSet {
  return DEMO[getActiveLocale()];
}
