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

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
