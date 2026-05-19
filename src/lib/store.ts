import { create } from "zustand";
import type { ModeId } from "./commands";
import { DEFAULT_MODEL } from "./models";
import { MODE_INTROS, makeId, type Message, type MessagePayload } from "./messages";
import type { RemoteModel } from "@/app/api/models/route";
import {
  DEMO_OPTIMIZE,
  DEMO_PRACTICE,
  DEMO_PREDICT,
  DEMO_REVIEW,
} from "./demo-payloads";
import { buildSystemPrompt } from "./prompts";
import { resolveModel } from "./model-mapping";
import { OUTPUT_SPECS } from "./output-specs";
import {
  DEFAULT_API_CONFIG,
  DEFAULT_PROFILE,
  PROVIDER_DEFAULT_URL,
  loadApiConfig,
  loadProfile,
  saveApiConfig,
  saveProfile,
  saveResume,
  deleteResume,
  recordUsage,
  loadUsageStats,
  type ApiConfig,
  type Profile,
  type Provider,
  type UsageStats,
} from "./db";
import {
  HISTORY_STUB,
  type HistoryItem,
  type MockHistoryItem,
  type OptimizeHistoryItem,
  type PracticeHistoryItem,
  type PredictHistoryItem,
  type ReviewHistoryItem,
} from "./history-stub";

export type SettingsTab = "profile" | "api" | "usage";

export type ToastKind = "success" | "info" | "error";
export type Toast = {
  id: string;
  text: string;
  kind: ToastKind;
  durationMs: number;
};

export type View =
  | { kind: "chat" }
  | { kind: "history"; mode: Exclude<ModeId, "chat"> };

type State = {
  view: View;
  chatMode: ModeId;
  settingsOpen: boolean;
  settingsTab: SettingsTab;
  sidebarExpanded: boolean;
  modelId: string;
  adaptiveThinking: boolean;
  modelPickerOpen: boolean;
  modelPickerSubOpen: boolean;
  messages: Message[];
  profile: Profile;
  apiConfig: ApiConfig;
  hydrated: boolean;
  availableModels: RemoteModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  usageStats: UsageStats | null;
  toasts: Toast[];
};

type Actions = {
  // Slash command — switches the current chat's mode without navigating away.
  activateChatMode: (id: ModeId | "settings") => void;
  // Sidebar — navigates between chat view and per-mode history lists.
  selectSidebarMode: (id: ModeId) => void;
  newChat: () => void;

  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setSettingsTab: (tab: SettingsTab) => void;

  hydrate: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  updateApiConfig: (patch: Partial<ApiConfig>) => Promise<void>;
  changeProvider: (provider: Provider) => Promise<void>;
  fetchModels: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  removeResume: () => Promise<void>;

  toggleSidebar: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;

  setModelId: (id: string) => void;
  toggleAdaptiveThinking: () => void;

  toggleModelPicker: () => void;
  setModelPickerSubOpen: (open: boolean) => void;
  closeModelPicker: () => void;

  sendUserMessage: (content: string) => void;
  appendIntroIfEmpty: (mode: ModeId) => void;
  loadHistoryItem: (mode: Exclude<ModeId, "chat">, itemId: string) => void;

  refreshUsage: () => Promise<void>;

  pushToast: (text: string, kind?: ToastKind, durationMs?: number) => string;
  dismissToast: (id: string) => void;
};

const PLACEHOLDER_AI_DELAY_MS = 600;

function placeholderReply(userText: string, mode: ModeId): string {
  const preview = userText.length > 64 ? userText.slice(0, 60) + "…" : userText;
  if (mode === "chat" || mode === "mock") {
    return `收到 —「${preview}」。请先输入 /setting 配置模型。`;
  }
  return "";
}

function payloadFor(mode: ModeId): MessagePayload | undefined {
  switch (mode) {
    case "review":
      return DEMO_REVIEW;
    case "predict":
      return DEMO_PREDICT;
    case "optimize":
      return DEMO_OPTIMIZE;
    case "practice":
      return DEMO_PRACTICE;
    default:
      return undefined;
  }
}

function richReplyPreamble(mode: ModeId): string {
  switch (mode) {
    case "review":
      return "拿到了，我从 STAR、技术深度、表达三个维度跑了一遍。";
    case "predict":
      return "基于你提供的目标 + 简历，我抽出了 10 道高概率题。";
    case "optimize":
      return "改写完了 — 下面是 Before / After 对照。";
    case "practice":
      return "随机抽一道题，90 秒读题，然后开始作答。";
    default:
      return "";
  }
}

export const useAppStore = create<State & Actions>((set, get) => ({
  view: { kind: "chat" },
  chatMode: "chat",
  settingsOpen: false,
  settingsTab: "profile",
  sidebarExpanded: false,
  modelId: DEFAULT_MODEL.id,
  adaptiveThinking: false,
  modelPickerOpen: false,
  modelPickerSubOpen: false,
  messages: [],
  profile: DEFAULT_PROFILE,
  apiConfig: DEFAULT_API_CONFIG,
  hydrated: false,
  availableModels: [],
  modelsLoading: false,
  modelsError: null,
  usageStats: null,
  toasts: [],

  activateChatMode: (id) => {
    if (id === "settings") {
      set({ settingsOpen: true, settingsTab: "profile" });
      return;
    }
    set({ chatMode: id, view: { kind: "chat" } });
    if (id !== "chat") get().appendIntroIfEmpty(id);
  },

  selectSidebarMode: (id) => {
    if (id === "chat") {
      set({ view: { kind: "chat" } });
    } else {
      set({ view: { kind: "history", mode: id } });
    }
  },

  newChat: () =>
    set({
      view: { kind: "chat" },
      chatMode: "chat",
      messages: [],
    }),

  openSettings: (tab) => set({ settingsOpen: true, settingsTab: tab ?? "profile" }),
  closeSettings: () => set({ settingsOpen: false }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  hydrate: async () => {
    if (get().hydrated) return;
    const [profile, apiConfig] = await Promise.all([loadProfile(), loadApiConfig()]);
    set({ profile, apiConfig, hydrated: true });
  },

  updateProfile: async (patch) => {
    const next = await saveProfile(patch);
    set({ profile: next });
  },

  updateApiConfig: async (patch) => {
    const next = await saveApiConfig(patch);
    const keyChanged = "apiKey" in patch;
    set({
      apiConfig: next,
      ...(keyChanged ? { availableModels: [], modelsError: null } : {}),
    });
    if (keyChanged && next.apiKey.trim()) void get().fetchModels();
  },

  changeProvider: async (provider: Provider) => {
    const current = get().apiConfig;
    const currentIsDefault =
      !current.baseURL ||
      Object.values(PROVIDER_DEFAULT_URL).includes(current.baseURL);
    const nextBaseURL = currentIsDefault
      ? PROVIDER_DEFAULT_URL[provider]
      : current.baseURL;
    const next = await saveApiConfig({ provider, baseURL: nextBaseURL });
    set({ apiConfig: next, availableModels: [], modelsError: null });
    if (next.apiKey.trim()) void get().fetchModels();
  },

  fetchModels: async () => {
    const { apiConfig } = get();
    if (!apiConfig.apiKey.trim()) {
      set({ availableModels: [], modelsError: null });
      return;
    }
    set({ modelsLoading: true, modelsError: null });
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: apiConfig.provider,
          apiKey: apiConfig.apiKey,
          baseURL: apiConfig.baseURL,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { models: RemoteModel[] };
      const list = data.models ?? [];
      // If current modelId not in the new list, pick the first one.
      const { modelId } = get();
      const stillValid = list.some((m) => m.id === modelId);
      set({
        availableModels: list,
        modelsLoading: false,
        ...(stillValid || list.length === 0
          ? {}
          : { modelId: list[0].id }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ modelsLoading: false, modelsError: msg, availableModels: [] });
      get().pushToast(`拉取模型失败：${msg}`, "error");
    }
  },

  uploadResume: async (file) => {
    const meta = await saveResume(file);
    const prev = get().profile.resumeBlobId;
    if (prev) await deleteResume(prev);
    const next = await saveProfile({
      resumeBlobId: meta.id,
      resumeFileName: meta.fileName,
      resumeFileSize: meta.fileSize,
    });
    set({ profile: next });
  },

  removeResume: async () => {
    const prev = get().profile.resumeBlobId;
    if (prev) await deleteResume(prev);
    const next = await saveProfile({
      resumeBlobId: undefined,
      resumeFileName: undefined,
      resumeFileSize: undefined,
    });
    set({ profile: next });
  },

  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  expandSidebar: () => set({ sidebarExpanded: true }),
  collapseSidebar: () => set({ sidebarExpanded: false }),

  setModelId: (id) =>
    set({ modelId: id, modelPickerOpen: false, modelPickerSubOpen: false }),
  toggleAdaptiveThinking: () => set((s) => ({ adaptiveThinking: !s.adaptiveThinking })),

  toggleModelPicker: () =>
    set((s) => ({
      modelPickerOpen: !s.modelPickerOpen,
      modelPickerSubOpen: s.modelPickerOpen ? false : s.modelPickerSubOpen,
    })),
  setModelPickerSubOpen: (open) => set({ modelPickerSubOpen: open }),
  closeModelPicker: () => set({ modelPickerOpen: false, modelPickerSubOpen: false }),

  refreshUsage: async () => {
    const stats = await loadUsageStats();
    set({ usageStats: stats });
  },

  pushToast: (text, kind = "info", durationMs = 3200) => {
    const id = makeId();
    set((s) => ({ toasts: [...s.toasts, { id, text, kind, durationMs }] }));
    if (durationMs > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, durationMs);
    }
    return id;
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  loadHistoryItem: (mode, itemId) => {
    const items = HISTORY_STUB[mode] as HistoryItem[];
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    set({
      view: { kind: "chat" },
      chatMode: mode,
      messages: messagesFromHistoryItem(item),
    });
  },

  appendIntroIfEmpty: (mode) => {
    if (mode === "chat") return;
    const { messages } = get();
    if (messages.length > 0) return;
    const introMode = mode as Exclude<ModeId, "chat">;
    const intro: Message = {
      id: makeId(),
      role: "assistant",
      content:
        introMode === "practice"
          ? richReplyPreamble(introMode)
          : MODE_INTROS[introMode],
      mode,
      createdAt: Date.now(),
    };
    if (introMode === "practice") {
      intro.payload = DEMO_PRACTICE;
    }
    set({ messages: [intro] });
  },

  sendUserMessage: (content) => {
    const text = content.trim();
    if (!text) return;
    const { chatMode: mode, apiConfig, modelId, profile, messages: prev } = get();
    const userMsg: Message = {
      id: makeId(),
      role: "user",
      content: text,
      mode,
      createdAt: Date.now(),
    };
    const pendingId = makeId();
    const pending: Message = {
      id: pendingId,
      role: "assistant",
      content: "",
      mode,
      pending: true,
      createdAt: Date.now() + 1,
    };
    set({ messages: [...prev, userMsg, pending] });

    if (apiConfig.apiKey.trim()) {
      void streamReply({
        pendingId,
        mode,
        userText: text,
        priorMessages: [...prev, userMsg],
        apiConfig,
        modelId,
        profile,
        set,
      });
      return;
    }

    // No API key — keep the demo / placeholder flow.
    setTimeout(() => {
      const payload = payloadFor(mode);
      const reply = payload ? richReplyPreamble(mode) : placeholderReply(text, mode);
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === pendingId
            ? { ...m, content: reply, pending: false, payload }
            : m,
        ),
      }));
    }, PLACEHOLDER_AI_DELAY_MS);
  },
}));

async function streamReply({
  pendingId,
  mode,
  priorMessages,
  apiConfig,
  modelId,
  profile,
  set,
}: {
  pendingId: string;
  mode: ModeId;
  userText: string;
  priorMessages: Message[];
  apiConfig: ReturnType<typeof useAppStore.getState>["apiConfig"];
  modelId: string;
  profile: ReturnType<typeof useAppStore.getState>["profile"];
  set: (
    partial:
      | Partial<ReturnType<typeof useAppStore.getState>>
      | ((
          s: ReturnType<typeof useAppStore.getState>,
        ) => Partial<ReturnType<typeof useAppStore.getState>>),
  ) => void;
}) {
  const system = buildSystemPrompt(mode, profile);
  const model = resolveModel(
    apiConfig.provider,
    modelId,
    apiConfig.modelOverride,
  );
  const apiMessages = normalizeForApi(priorMessages);
  if (apiMessages.length === 0) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === pendingId
          ? { ...m, content: "⚠️ 还没有可发送的用户消息", pending: false }
          : m,
      ),
    }));
    return;
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: apiConfig.provider,
        apiKey: apiConfig.apiKey,
        baseURL: apiConfig.baseURL,
        model,
        system,
        messages: apiMessages,
      }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => "请求失败");
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === pendingId
            ? { ...m, content: `⚠️ ${errText}`, pending: false }
            : m,
        ),
      }));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const spec = OUTPUT_SPECS[mode];
    let acc = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      const { displayText } = stripUsageTrailer(acc);
      const partial = spec?.parsePartial(displayText) ?? null;
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === pendingId
            ? partial
              ? {
                  ...m,
                  content: partial.summary,
                  payload: partial.payload,
                  pending: false,
                }
              : { ...m, content: displayText, payload: undefined, pending: false }
            : m,
        ),
      }));
    }
    acc += decoder.decode();
    const { displayText: finalText, trailer } = stripUsageTrailer(acc);

    // Final pass: strict parse confirms all required fields landed.
    const finalParsed = spec?.parse(finalText) ?? null;
    if (finalParsed) {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                content: finalParsed.summary,
                payload: finalParsed.payload,
                pending: false,
              }
            : m,
        ),
      }));
    } else {
      // Strict parse failed — keep whatever partial state we ended on, or
      // fall through to plain text if no schema ever appeared.
      set((s) => ({
        messages: s.messages.map((m) => {
          if (m.id !== pendingId) return m;
          if (m.payload) return { ...m, pending: false };
          return { ...m, content: finalText, pending: false };
        }),
      }));
    }

    // Record token usage emitted by the server's `finish` event.
    if (trailer) {
      try {
        const data = JSON.parse(trailer);
        if (data && data.type === "usage") {
          await recordUsage({
            ts: Date.now(),
            model: String(data.model ?? modelId),
            promptTokens: Number(data.inputTokens) || 0,
            completionTokens: Number(data.outputTokens) || 0,
            costUsd: 0,
          });
          void useAppStore.getState().refreshUsage();
        }
      } catch {
        // Malformed trailer — ignore.
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === pendingId
          ? { ...m, content: `⚠️ 调用失败：${msg}`, pending: false }
          : m,
      ),
    }));
  }
}

function messagesFromHistoryItem(item: HistoryItem): Message[] {
  const baseTs = Date.now();
  switch (item.kind) {
    case "mock": {
      const m = item as MockHistoryItem;
      return [
        {
          id: makeId(),
          role: "user",
          content: `开始 ${m.co} 的模拟面试 — ${m.role}，重点放在 ${m.round}。`,
          mode: "mock",
          createdAt: baseTs,
        },
        {
          id: makeId(),
          role: "assistant",
          content: `好。我们这一轮按 ${m.round} 走，时间预算约 ${m.duration}。先用一个 system design 的题切入：在 ${m.co} 内部产品里，你会怎么设计一个支持多团队协作的实时编辑系统？\n\n（这是历史会话快照 · 评级 ${m.grade}）`,
          mode: "mock",
          createdAt: baseTs + 1,
        },
      ];
    }
    case "review": {
      const r = item as ReviewHistoryItem;
      return [
        {
          id: makeId(),
          role: "user",
          content: `${r.source}\n\n"面试官：聊一下你最难的一次跨团队协作…\n我：当时我们要推一个埋点规范，涉及 5 个业务线。我先去找了各业务的负责人聊…"`,
          mode: "review",
          createdAt: baseTs,
        },
        {
          id: makeId(),
          role: "assistant",
          content: `${r.co} · ${r.round} 复盘已完成。整体评级取决于 ${r.top}，详见下方维度卡。`,
          mode: "review",
          createdAt: baseTs + 1,
          payload: DEMO_REVIEW,
        },
      ];
    }
    case "practice": {
      const p = item as PracticeHistoryItem;
      return [
        {
          id: makeId(),
          role: "assistant",
          content: `（第 ${p.n} 题 · ${p.type} · 用时 ${p.duration} · 评级 ${p.rating}）`,
          mode: "practice",
          createdAt: baseTs,
          payload: {
            ...DEMO_PRACTICE,
            title: p.q,
            category: p.type,
            difficulty: DEMO_PRACTICE.difficulty,
            estimated: `预计 ${p.duration}`,
            track: DEMO_PRACTICE.track,
          },
        },
      ];
    }
    case "predict": {
      const f = item as PredictHistoryItem;
      return [
        {
          id: makeId(),
          role: "user",
          content: `基于 ${f.title} 的 JD + 我的简历，预测可能的面试题。`,
          mode: "predict",
          createdAt: baseTs,
        },
        {
          id: makeId(),
          role: "assistant",
          content: `已生成 ${f.total} 道预测题，目前命中 ${f.hit} 题、${f.pending} 待验证。`,
          mode: "predict",
          createdAt: baseTs + 1,
          payload: { ...DEMO_PREDICT, context: f.basis, hottest: f.hottest, total: f.total },
        },
      ];
    }
    case "optimize": {
      const o = item as OptimizeHistoryItem;
      return [
        {
          id: makeId(),
          role: "user",
          content: o.before,
          mode: "optimize",
          createdAt: baseTs,
        },
        {
          id: makeId(),
          role: "assistant",
          content: `改写完了 — 主轴 ${o.tag}，下面是 Before / After 对照。`,
          mode: "optimize",
          createdAt: baseTs + 1,
          payload: {
            ...DEMO_OPTIMIZE,
            question: o.q,
            tag: o.tag,
            before: o.before,
            after: o.after,
          },
        },
      ];
    }
  }
}

/**
 * Pull the `{json}` usage trailer the server appends after
 * the `finish` event. Returns the cleaned display text and the raw JSON
 * blob (if any). Handles partial trailers (only opening marker received
 * so far) by hiding the orphan tail until the closer arrives.
 */
function stripUsageTrailer(text: string): {
  displayText: string;
  trailer: string | null;
} {
  const start = text.indexOf("");
  if (start === -1) return { displayText: text, trailer: null };
  const end = text.indexOf("", start + 1);
  if (end === -1) {
    // Opening seen, closer pending — hide the partial chunk.
    return { displayText: text.substring(0, start), trailer: null };
  }
  return {
    displayText: text.substring(0, start) + text.substring(end + 1),
    trailer: text.substring(start + 1, end),
  };
}

/**
 * Materialize a message's text for API replay. If the message carries
 * a rich payload (parsed structured response or demo / loaded history),
 * we re-serialize the payload so the next AI turn sees the original
 * schema context — not just the human-friendly summary blurb.
 */
function fullText(m: Message): string {
  if (m.payload) {
    const spec = OUTPUT_SPECS[m.mode];
    if (spec) return spec.serialize(m.payload, m.content);
  }
  return m.content;
}

function normalizeForApi(
  msgs: Message[],
): Array<{ role: "user" | "assistant"; content: string }> {
  const live = msgs.filter((m) => !m.pending && fullText(m).trim());
  let i = 0;
  while (i < live.length && live[i].role !== "user") i++;
  const trimmed = live.slice(i);
  const merged: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of trimmed) {
    const text = fullText(m);
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content}\n\n${text}`;
    } else {
      merged.push({ role: m.role, content: text });
    }
  }
  return merged;
}
