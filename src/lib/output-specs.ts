/**
 * Structured-output registry for AI-driven modes.
 *
 * Each mode that wants rich-card rendering registers an `OutputSpec`:
 *  - `promptInstructions`: appended to the system prompt so the model
 *    knows what shape to emit
 *  - `parse(text)`: strict parser for the completed stream — returns
 *    null if required fields are missing (caller falls back to plain text)
 *  - `parsePartial(text)`: lenient parser run on each chunk so the card
 *    can render and fill fields progressively while streaming
 *  - `serialize(payload, summary)`: inverse of parse — used when replaying
 *    history to the API so the next AI turn sees the full schema context
 *
 * Renderer dispatch is in `MessageList → ModeCard` keyed on `payload.kind`.
 */

import type { ModeId } from "./commands";
import type {
  MessagePayload,
  OptimizeDiffPayload,
  PracticeQuestionPayload,
  PredictSessionPayload,
  ReviewFeedbackPayload,
  ReviewScore,
} from "./messages";
import { tt } from "./i18n/runtime";

export type ParseResult = {
  payload: MessagePayload;
  /** Short text that appears as the assistant bubble body (above the card). */
  summary: string;
};

export type OutputSpec = {
  promptInstructions: string;
  parse: (text: string) => ParseResult | null;
  parsePartial: (text: string) => ParseResult | null;
  serialize: (payload: MessagePayload, summary: string) => string;
};

// ─── Helpers ─────────────────────────────────────────────────────────

function extractSection(text: string, ...labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(
      `\\[\\s*${label}\\s*\\][^\\S\\r\\n]*\\n?([\\s\\S]*?)(?=\\n\\s*\\[\\s*[^\\]]+\\s*\\]|$)`,
      "i",
    );
    const m = text.match(re);
    if (m && m[1].trim()) return m[1].trim();
  }
  return null;
}

function parseBullets(text: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*·]\s*/, "").trim())
    .filter((l) => l.length > 0);
}

const ANY_LABEL = /\[\s*[^\]\n]+\s*\]/;

// ─── Optimize ────────────────────────────────────────────────────────

const OPTIMIZE_PROMPT = `严格按以下格式输出，用方括号标签分段，不要加任何额外说明：

[问题]
（这段答案对应的面试题，从用户输入推断；推断不出就写「未指定」）

[Before]
（用户原稿，原样回填，不要改）

[After]
（你的改写版本，使用 STAR / 结构化 / 加论据等手法）

[Tag]
（改进维度，例如「STAR · T+R」或「结构化 · 加论据」，3-8 个字符）

[说明]
（一句话说明为什么这样写更稳，30 字内）

每段之间空一行。标签拼写要完全一致。`;

function parseOptimize(text: string): ParseResult | null {
  const before = extractSection(text, "Before", "草稿");
  const after = extractSection(text, "After", "改写");
  if (!before || !after) return null;
  return {
    payload: {
      kind: "optimize_diff",
      question: extractSection(text, "问题", "Question") ?? "未指定",
      before,
      after,
      tag: extractSection(text, "Tag", "标签") ?? "STAR",
    },
    summary: extractSection(text, "说明", "Note") ?? tt().preamble.optimize,
  };
}

function parsePartialOptimize(text: string): ParseResult | null {
  if (!ANY_LABEL.test(text)) return null;
  return {
    payload: {
      kind: "optimize_diff",
      question: extractSection(text, "问题", "Question") ?? "",
      before: extractSection(text, "Before", "草稿") ?? "",
      after: extractSection(text, "After", "改写") ?? "",
      tag: extractSection(text, "Tag", "标签") ?? "",
    },
    summary: extractSection(text, "说明", "Note") ?? tt().preamble.optimizeWriting,
  };
}

function serializeOptimize(payload: MessagePayload, summary: string): string {
  const p = payload as OptimizeDiffPayload;
  return [
    `[问题]\n${p.question}`,
    `[Before]\n${p.before}`,
    `[After]\n${p.after}`,
    `[Tag]\n${p.tag}`,
    `[说明]\n${summary}`,
  ].join("\n\n");
}

// ─── Review ──────────────────────────────────────────────────────────

const REVIEW_PROMPT = `严格按以下格式输出，用方括号标签分段，不要加任何额外说明：

[总评]
（一段话总评 80-150 字，指出最值得说的 1-2 处亮点和 1-2 处问题）

[评分]
- 整体表现 | B+ | 良好 | neutral
- STAR 结构 | S | 完整 | good
- T 任务定义 | T | 偏弱 | warn
- 结果量化 | R | 缺数据 | bad

格式：每行一项，用 | 分隔 4 个字段：维度名 | 等级（S/A/B/C 或 STAR 字母）| 短评 2-4 字 | 意图（必须是 good/warn/bad/neutral 之一）。**严格 4 行**。

[做得好的]
- {一条具体行为，不空泛}
- {同上}
- {同上}

[下次试试]
- {一条可操作建议}
- {同上}
- {同上}

[改写]
（一段示范重写，针对你点出的最大问题段落，30-100 字，用引号包裹）

[改写维度]
（例如「STAR · T」或「STAR · R」，3-8 个字符）

各段之间空一行，每个列表正好 3 条。`;

function parseScoreList(text: string | null): ReviewScore[] {
  if (!text) return [];
  const allowed = new Set(["good", "warn", "bad", "neutral"]);
  return parseBullets(text)
    .map((line): ReviewScore | null => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 3 || !parts[0]) return null;
      const intentRaw = (parts[3] ?? "neutral").toLowerCase();
      const intent = (allowed.has(intentRaw) ? intentRaw : "neutral") as ReviewScore["intent"];
      return {
        label: parts[0],
        grade: parts[1] || "",
        tone: parts[2] || "",
        intent,
      };
    })
    .filter((r): r is ReviewScore => r !== null);
}

function parseReview(text: string): ParseResult | null {
  const summary = extractSection(text, "总评", "Summary");
  const scores = parseScoreList(extractSection(text, "评分", "Scores"));
  const strengths = parseBullets(extractSection(text, "做得好的", "Strengths"));
  const improvements = parseBullets(extractSection(text, "下次试试", "Improvements"));
  const rewriteText = extractSection(text, "改写", "Rewrite");
  const rewriteTag = extractSection(text, "改写维度", "Rewrite Tag", "Tag");
  if (!summary || scores.length === 0 || !rewriteText) return null;
  return {
    payload: {
      kind: "review_feedback",
      summary,
      scores,
      strengths,
      improvements,
      rewrite: { tag: rewriteTag ?? "STAR", text: rewriteText },
    },
    summary: tt().preamble.review,
  };
}

function parsePartialReview(text: string): ParseResult | null {
  if (!ANY_LABEL.test(text)) return null;
  return {
    payload: {
      kind: "review_feedback",
      summary: extractSection(text, "总评", "Summary") ?? "",
      scores: parseScoreList(extractSection(text, "评分", "Scores")),
      strengths: parseBullets(extractSection(text, "做得好的", "Strengths")),
      improvements: parseBullets(extractSection(text, "下次试试", "Improvements")),
      rewrite: {
        tag: extractSection(text, "改写维度", "Rewrite Tag", "Tag") ?? "",
        text: extractSection(text, "改写", "Rewrite") ?? "",
      },
    },
    summary: tt().preamble.review,
  };
}

function serializeReview(payload: MessagePayload): string {
  const p = payload as ReviewFeedbackPayload;
  const scoreLines = p.scores
    .map((s) => `- ${s.label} | ${s.grade} | ${s.tone} | ${s.intent}`)
    .join("\n");
  const strLines = p.strengths.map((s) => `- ${s}`).join("\n");
  const impLines = p.improvements.map((s) => `- ${s}`).join("\n");
  return [
    `[总评]\n${p.summary}`,
    `[评分]\n${scoreLines}`,
    `[做得好的]\n${strLines}`,
    `[下次试试]\n${impLines}`,
    `[改写]\n${p.rewrite.text}`,
    `[改写维度]\n${p.rewrite.tag}`,
  ].join("\n\n");
}

// ─── Predict ─────────────────────────────────────────────────────────

const PREDICT_PROMPT = `严格按以下格式输出，用方括号标签分段，不要加任何额外说明：

[上下文]
（一句话描述生成依据，例如「基于 Google JD + 你的简历」）

[高概率方向]
- {方向 1}
- {方向 2}
- {方向 3}

[题目]
01. {题干} | {类型} | {命中概率 0-100}
02. {题干} | {类型} | {命中概率 0-100}
...

题目段格式：每行一题，序号 + . + 空格 + 题干 + " | " + 类型 + " | " + 0-100 整数（不要 %）。生成 8-12 题，**按概率从高到低排列**。类型按用户岗位合理选取，例如：前端 / 后端 / 系统设计 / 算法 / AI 与机器学习 / 数据 / 工程实践 / 行为面 等。`;

function parseQuestionList(
  text: string | null,
): { q: string; category: string; prob: number }[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line): { q: string; category: string; prob: number } | null => {
      const stripped = line.replace(/^\s*\d+\.?\s*/, "").trim();
      if (!stripped) return null;
      const parts = stripped.split("|").map((p) => p.trim());
      if (parts.length < 2 || !parts[0]) return null;
      const probMatch = parts[2]?.match(/-?\d+(?:\.\d+)?/);
      const probRaw = probMatch ? parseFloat(probMatch[0]) : 50;
      const prob = Math.max(0, Math.min(100, probRaw)) / 100;
      return { q: parts[0], category: parts[1] || "未分类", prob };
    })
    .filter(
      (r): r is { q: string; category: string; prob: number } => r !== null,
    );
}

function parsePredict(text: string): ParseResult | null {
  const context = extractSection(text, "上下文", "Context");
  const hottest = parseBullets(extractSection(text, "高概率方向", "Top", "Hottest"));
  const questions = parseQuestionList(extractSection(text, "题目", "Questions"));
  if (!context || questions.length === 0) return null;
  return {
    payload: {
      kind: "predict_session",
      context,
      hottest,
      questions,
      total: questions.length,
    },
    summary: tt().preamble.predict,
  };
}

function parsePartialPredict(text: string): ParseResult | null {
  if (!ANY_LABEL.test(text)) return null;
  const questions = parseQuestionList(extractSection(text, "题目", "Questions"));
  return {
    payload: {
      kind: "predict_session",
      context: extractSection(text, "上下文", "Context") ?? "",
      hottest: parseBullets(extractSection(text, "高概率方向", "Top", "Hottest")),
      questions,
      total: questions.length,
    },
    summary: tt().preamble.predict,
  };
}

function serializePredict(payload: MessagePayload): string {
  const p = payload as PredictSessionPayload;
  const hotLines = p.hottest.map((h) => `- ${h}`).join("\n");
  const qLines = p.questions
    .map(
      (q, i) =>
        `${(i + 1).toString().padStart(2, "0")}. ${q.q} | ${q.category} | ${Math.round(q.prob * 100)}`,
    )
    .join("\n");
  return [
    `[上下文]\n${p.context}`,
    `[高概率方向]\n${hotLines}`,
    `[题目]\n${qLines}`,
  ].join("\n\n");
}

// ─── Practice ────────────────────────────────────────────────────────

const PRACTICE_PROMPT = `严格按以下格式输出，用方括号标签分段，不要加任何额外说明：

[标题]
（题目标题，10-20 字）

[题干]
（详细描述题目场景与约束，50-200 字，可以分行）

[类型]
（系统设计 / 行为 / 算法 / 概念 / 工程实践 / 前端 任选一个，按用户岗位方向合理选取）

[难度]
（容易 / 中等 / 困难 之一）

[预计时长]
（例如「预计 12 min」）

[方向]
（用户的目标研发方向，例如 前端 / 后端 / 全栈 / AI / 算法 / 客户端 / 数据；画像为空就写「未指定」）

[评分维度]
（4 个维度，用 · 分隔，须贴合上方「方向」：后端 / 系统→「可扩展性 · 一致性 · 取舍说明 · 边界情况」；前端→「可维护性 · 性能 · 可访问性 · 组件设计」；算法→「复杂度 · 正确性 · 数据结构取舍 · 边界情况」；AI→「建模思路 · 数据 · 评估方法 · 取舍」）

各段之间空一行。`;

function parsePractice(text: string): ParseResult | null {
  const title = extractSection(text, "标题", "Title");
  const body = extractSection(text, "题干", "Body");
  if (!title || !body) return null;
  return {
    payload: {
      kind: "practice_question",
      title,
      body,
      category: extractSection(text, "类型", "Category") ?? "",
      difficulty: extractSection(text, "难度", "Difficulty") ?? "",
      estimated: extractSection(text, "预计时长", "Estimated") ?? "",
      track: extractSection(text, "方向", "Track") ?? "",
      criteria: extractSection(text, "评分维度", "Criteria") ?? "",
    },
    summary: tt().preamble.practice,
  };
}

function parsePartialPractice(text: string): ParseResult | null {
  if (!ANY_LABEL.test(text)) return null;
  return {
    payload: {
      kind: "practice_question",
      title: extractSection(text, "标题", "Title") ?? "",
      body: extractSection(text, "题干", "Body") ?? "",
      category: extractSection(text, "类型", "Category") ?? "",
      difficulty: extractSection(text, "难度", "Difficulty") ?? "",
      estimated: extractSection(text, "预计时长", "Estimated") ?? "",
      track: extractSection(text, "方向", "Track") ?? "",
      criteria: extractSection(text, "评分维度", "Criteria") ?? "",
    },
    summary: tt().preamble.practice,
  };
}

function serializePractice(payload: MessagePayload): string {
  const p = payload as PracticeQuestionPayload;
  return [
    `[标题]\n${p.title}`,
    `[题干]\n${p.body}`,
    `[类型]\n${p.category}`,
    `[难度]\n${p.difficulty}`,
    `[预计时长]\n${p.estimated}`,
    `[方向]\n${p.track}`,
    `[评分维度]\n${p.criteria}`,
  ].join("\n\n");
}

// ─── Registry ────────────────────────────────────────────────────────

export const OUTPUT_SPECS: Partial<Record<ModeId, OutputSpec>> = {
  optimize: {
    promptInstructions: OPTIMIZE_PROMPT,
    parse: parseOptimize,
    parsePartial: parsePartialOptimize,
    serialize: serializeOptimize,
  },
  review: {
    promptInstructions: REVIEW_PROMPT,
    parse: parseReview,
    parsePartial: parsePartialReview,
    serialize: serializeReview,
  },
  predict: {
    promptInstructions: PREDICT_PROMPT,
    parse: parsePredict,
    parsePartial: parsePartialPredict,
    serialize: serializePredict,
  },
  practice: {
    promptInstructions: PRACTICE_PROMPT,
    parse: parsePractice,
    parsePartial: parsePartialPractice,
    serialize: serializePractice,
  },
};
