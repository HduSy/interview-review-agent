import type { ModeId } from "./commands";

export type Role = "user" | "assistant";

export type ReviewScore = { label: string; grade: string; tone: string; intent: "good" | "warn" | "bad" | "neutral" };
export type ReviewFeedbackPayload = {
  kind: "review_feedback";
  summary: string;
  scores: ReviewScore[];
  strengths: string[];
  improvements: string[];
  rewrite: { tag: string; text: string };
};

export type PracticeQuestionPayload = {
  kind: "practice_question";
  category: string;
  difficulty: string;
  estimated: string;
  track: string;
  title: string;
  body: string;
  criteria: string;
};

export type PredictSessionPayload = {
  kind: "predict_session";
  context: string;
  hottest: string[];
  questions: { q: string; category: string; prob: number }[];
  total: number;
};

export type OptimizeDiffPayload = {
  kind: "optimize_diff";
  question: string;
  tag: string;
  before: string;
  after: string;
};

export type MessagePayload =
  | ReviewFeedbackPayload
  | PracticeQuestionPayload
  | PredictSessionPayload
  | OptimizeDiffPayload;

export type Message = {
  id: string;
  role: Role;
  content: string;
  mode: ModeId;
  pending?: boolean;
  /** Stream failed. Renders inline with a retry affordance; excluded from
   *  persisted sessions and from outgoing API history. */
  error?: boolean;
  /** User aborted mid-stream. Kept in history (partial response is real
   *  content from the model), but rendered with a subtle "stopped" hint. */
  aborted?: boolean;
  payload?: MessagePayload;
  createdAt: number;
};

export const MODE_INTROS: Record<Exclude<ModeId, "chat">, string> = {
  mock:
    "Mock 模式已就绪。告诉我目标岗位与公司，我会按对应风格出题；如果你已经在 /settings 配过画像，直接说『开始』就行。",
  review:
    "把面试记录粘进来 — 越完整越好。我会从 STAR 结构、技术深度、表达清晰度三个维度给结构化反馈。",
  practice:
    "随时说『出题』或按回车，我会基于你的画像随机抽一道。作答后立即给反馈，不打断。",
  predict:
    "告诉我目标公司 / 岗位（或粘 JD），我会基于你的简历和画像生成 8–12 道可能被问到的题。",
  optimize:
    "把你写好的答案草稿贴进来。我会按 STAR 法则点出问题段落，给一个改写版本，告诉你为什么这样写更稳。",
};

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
