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
  loadSessionById,
  loadSessions,
  saveApiConfig,
  saveProfile,
  saveResume,
  deleteResume,
  recordUsage,
  loadUsageStats,
  upsertSession,
  deleteSession,
  type ApiConfig,
  type Profile,
  type Provider,
  type ProviderConfigSlice,
  type Session,
  type UsageStats,
} from "./db";
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
  /** The pending assistant message id currently being streamed, or null. */
  streamingPendingId: string | null;
  sessions: Session[];
  currentSessionId: string | null;
  profile: Profile;
  apiConfig: ApiConfig;
  hydrated: boolean;
  availableModels: RemoteModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  usageStats: UsageStats | null;
  toasts: Toast[];
  githubUser: GithubUser | null;
  authChecked: boolean;
};

export type GithubUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
};

type Actions = {
  // Slash command — switches the current chat's mode. Triggers an implicit
  // newChat when the mode actually changes (mixing intro / system prompts
  // across modes was confusing).
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
  stopStreaming: () => void;
  retryMessage: (assistantMessageId: string) => void;
  appendIntroIfEmpty: (mode: ModeId) => void;
  loadSession: (id: string) => Promise<void>;
  deleteCurrentSession: () => Promise<void>;

  refreshUsage: () => Promise<void>;

  loadGithubUser: () => Promise<void>;

  pushToast: (text: string, kind?: ToastKind, durationMs?: number) => string;
  dismissToast: (id: string) => void;
};

// Non-reactive: AbortController for the in-flight stream lives outside the
// store so writing to it doesn't trigger re-renders. The store only tracks
// `streamingPendingId` for UI affordances.
let activeAbortController: AbortController | null = null;

function abortActiveStream(): void {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
}

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
  streamingPendingId: null,
  sessions: [],
  currentSessionId: null,
  profile: DEFAULT_PROFILE,
  apiConfig: DEFAULT_API_CONFIG,
  hydrated: false,
  availableModels: [],
  modelsLoading: false,
  modelsError: null,
  usageStats: null,
  toasts: [],
  githubUser: null,
  authChecked: false,

  activateChatMode: (id) => {
    if (id === "settings") {
      set({ settingsOpen: true, settingsTab: "profile" });
      return;
    }
    const { chatMode } = get();
    // Mode actually changed → fresh chat. Carrying over text history into
    // a new mode confuses the model (different system prompt, structured
    // output schema mismatch) and produces unhelpful answers.
    if (chatMode !== id) {
      abortActiveStream();
      set({
        chatMode: id,
        view: { kind: "chat" },
        messages: [],
        currentSessionId: null,
        streamingPendingId: null,
      });
      if (id !== "chat") get().appendIntroIfEmpty(id);
      return;
    }
    // Same mode — keep history; just snap back to chat view.
    set({ view: { kind: "chat" } });
    if (id !== "chat") get().appendIntroIfEmpty(id);
  },

  selectSidebarMode: (id) => {
    if (id === "chat") {
      set({ view: { kind: "chat" } });
    } else {
      set({ view: { kind: "history", mode: id } });
    }
  },

  newChat: () => {
    abortActiveStream();
    set({
      view: { kind: "chat" },
      chatMode: "chat",
      messages: [],
      currentSessionId: null,
      streamingPendingId: null,
    });
  },

  openSettings: (tab) => set({ settingsOpen: true, settingsTab: tab ?? "profile" }),
  closeSettings: () => set({ settingsOpen: false }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  hydrate: async () => {
    if (get().hydrated) return;
    const [profile, apiConfig, rawSessions] = await Promise.all([
      loadProfile(),
      loadApiConfig(),
      loadSessions(),
    ]);
    // Any `pending: true` message in a loaded session is a leftover from
    // a stream that never finished writing back (e.g. user navigated
    // away mid-stream, or a tab crash). Drop it so the session doesn't
    // re-open with a forever-loading bubble.
    const sessions = await scrubStalePendingMessages(rawSessions);
    set({ profile, apiConfig, sessions, hydrated: true });
    // `availableModels` is in-memory only — re-fetch on every page load
    // so the model picker doesn't render "无可用模型" with a valid key.
    if (apiConfig.apiKey.trim()) void get().fetchModels();
  },

  updateProfile: async (patch) => {
    const next = await saveProfile(patch);
    set({ profile: next });
  },

  updateApiConfig: async (patch) => {
    const current = get().apiConfig;
    // Persist patched fields into the per-provider slice as well, so
    // switching providers can restore exactly what the user typed.
    const slice = current.byProvider?.[current.provider] ?? {
      apiKey: current.apiKey,
      baseURL: current.baseURL,
      modelOverride: current.modelOverride,
    };
    const sliceNext: ProviderConfigSlice = {
      apiKey: "apiKey" in patch ? (patch.apiKey ?? "") : slice.apiKey,
      baseURL: "baseURL" in patch ? patch.baseURL : slice.baseURL,
      modelOverride:
        "modelOverride" in patch ? patch.modelOverride : slice.modelOverride,
    };
    const byProvider = {
      ...(current.byProvider ?? {}),
      [current.provider]: sliceNext,
    };
    const next = await saveApiConfig({ ...patch, byProvider });
    const keyChanged = "apiKey" in patch;
    set({
      apiConfig: next,
      ...(keyChanged ? { availableModels: [], modelsError: null } : {}),
    });
    if (keyChanged && next.apiKey.trim()) void get().fetchModels();
  },

  changeProvider: async (provider: Provider) => {
    const current = get().apiConfig;
    if (current.provider === provider) return;

    // 1) Snapshot current fields back into the OLD provider's slice so
    //    switching away and back round-trips losslessly.
    const oldSlice: ProviderConfigSlice = {
      apiKey: current.apiKey,
      baseURL: current.baseURL,
      modelOverride: current.modelOverride,
    };
    const byProvider = {
      ...(current.byProvider ?? {}),
      [current.provider]: oldSlice,
    };

    // 2) Hydrate fields for the NEW provider. If never configured, reset
    //    to an empty form (default baseURL only).
    const saved = byProvider[provider];
    const nextFields: ProviderConfigSlice = saved ?? {
      apiKey: "",
      baseURL: PROVIDER_DEFAULT_URL[provider],
      modelOverride: undefined,
    };

    const next = await saveApiConfig({
      provider,
      apiKey: nextFields.apiKey,
      baseURL: nextFields.baseURL,
      modelOverride: nextFields.modelOverride,
      byProvider,
    });
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

  loadGithubUser: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        set({ githubUser: null, authChecked: true });
        return;
      }
      const data = (await res.json()) as { user: GithubUser | null };
      set({ githubUser: data.user, authChecked: true });
    } catch {
      set({ githubUser: null, authChecked: true });
    }
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

  loadSession: async (id) => {
    abortActiveStream();
    const cached = get().sessions.find((s) => s.id === id);
    const session = cached ?? (await loadSessionById(id));
    if (!session) return;
    set({
      view: { kind: "chat" },
      chatMode: session.mode,
      messages: session.messages,
      currentSessionId: session.id,
      streamingPendingId: null,
    });
  },

  deleteCurrentSession: async () => {
    const id = get().currentSessionId;
    if (!id) return;
    abortActiveStream();
    await deleteSession(id);
    set((s) => ({
      sessions: s.sessions.filter((x) => x.id !== id),
      messages: [],
      currentSessionId: null,
      streamingPendingId: null,
      view: { kind: "chat" },
      chatMode: "chat",
    }));
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
    const {
      chatMode: mode,
      apiConfig,
      modelId,
      profile,
      messages: prev,
      currentSessionId,
    } = get();

    // Allocate session id synchronously so streamReply can persist
    // directly to it even if the user navigates away mid-stream.
    const sessionId = currentSessionId ?? makeId();
    if (!currentSessionId) set({ currentSessionId: sessionId });

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
    // Persistence is deferred to the stream / placeholder completion. If
    // the user exits the session before then, the half-baked turn is
    // intentionally discarded and never lands in DB.

    if (apiConfig.apiKey.trim()) {
      set({ streamingPendingId: pendingId });
      void streamReply({
        sessionId,
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
      // Skip persist if the user navigated away during the 600ms delay.
      if (useAppStore.getState().currentSessionId === sessionId) {
        void persistCurrentSession();
      }
    }, PLACEHOLDER_AI_DELAY_MS);
  },

  stopStreaming: () => {
    abortActiveStream();
    // The streamReply finally block will flip streamingPendingId; nothing
    // more to do here.
  },

  retryMessage: (assistantMessageId) => {
    // Walk back from the failed/aborted assistant message to find the user
    // message that triggered it, drop the assistant stub, and resubmit.
    const { messages } = get();
    const idx = messages.findIndex((m) => m.id === assistantMessageId);
    if (idx === -1) return;
    let userIdx = idx - 1;
    while (userIdx >= 0 && messages[userIdx].role !== "user") userIdx--;
    if (userIdx < 0) return;
    const userText = messages[userIdx].content;
    // Truncate history at the user message (exclusive) so the resubmitted
    // user message isn't duplicated.
    set({ messages: messages.slice(0, userIdx) });
    get().sendUserMessage(userText);
  },
}));

async function streamReply({
  sessionId,
  pendingId,
  mode,
  priorMessages,
  apiConfig,
  modelId,
  profile,
  set,
}: {
  sessionId: string;
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

  function applyAssistant(patch: Partial<Message>) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === pendingId ? { ...m, ...patch, pending: false } : m,
      ),
    }));
  }

  function persist() {
    const state = useAppStore.getState();
    // If the user navigated away from this session before the stream
    // finished, drop the result — by design, half-finished turns never
    // land in DB.
    if (state.currentSessionId !== sessionId) return;
    void writeSession({
      sessionId,
      mode,
      messages: state.messages,
    });
  }

  const apiMessages = normalizeForApi(priorMessages);
  if (apiMessages.length === 0) {
    applyAssistant({ content: "还没有可发送的用户消息", error: true });
    set((s) => ({
      streamingPendingId: s.streamingPendingId === pendingId ? null : s.streamingPendingId,
    }));
    return;
  }

  // Each in-flight call owns its AbortController. stopStreaming() and
  // newChat() both abort it; the cleanup below clears the module-level
  // reference only if it still points at this call (avoids a later call
  // clobbering an earlier one).
  const controller = new AbortController();
  activeAbortController = controller;
  let aborted = false;
  let acc = "";
  let lastDisplayText = "";

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
      signal: controller.signal,
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => "请求失败");
      applyAssistant({ content: errText, error: true });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const spec = OUTPUT_SPECS[mode];
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const { displayText } = stripUsageTrailer(acc);
        lastDisplayText = displayText;
        const partial = spec?.parsePartial(displayText) ?? null;
        if (partial) {
          applyAssistant({ content: partial.summary, payload: partial.payload });
        } else {
          applyAssistant({ content: displayText, payload: undefined });
        }
      }
    } catch (err) {
      // AbortError surfaces here when the user clicks stop. Treat the
      // partial content already streamed as a real (truncated) reply.
      if ((err as Error).name === "AbortError") {
        aborted = true;
      } else {
        throw err;
      }
    }
    acc += decoder.decode();
    const { displayText: finalText, trailer } = stripUsageTrailer(acc);

    if (aborted) {
      // Keep whatever streamed so far; mark aborted for UI hint.
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                content: lastDisplayText || finalText,
                pending: false,
                aborted: true,
              }
            : m,
        ),
      }));
      persist();
      return;
    }

    // Final pass: strict parse confirms all required fields landed.
    const finalParsed = spec?.parse(finalText) ?? null;
    if (finalParsed) {
      applyAssistant({
        content: finalParsed.summary,
        payload: finalParsed.payload,
      });
    } else {
      // Strict parse failed — keep mid-stream partial payload if any,
      // otherwise fall back to plain accumulated text.
      set((s) => ({
        messages: s.messages.map((m) => {
          if (m.id !== pendingId) return m;
          if (m.payload) return { ...m, pending: false };
          return { ...m, content: finalText, pending: false };
        }),
      }));
    }
    persist();

    // After the first successful exchange persists, ask the model for a
    // short title — much better than truncating the user's first line.
    void maybeGenerateTitle({ sessionId, mode, apiConfig, modelId });

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
    if ((err as Error).name === "AbortError") {
      // Network-level abort (before stream started) — drop the pending
      // bubble entirely; the user explicitly cancelled.
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== pendingId),
      }));
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      applyAssistant({ content: `调用失败：${msg}`, error: true });
    }
  } finally {
    if (activeAbortController === controller) activeAbortController = null;
    set((s) => ({
      streamingPendingId: s.streamingPendingId === pendingId ? null : s.streamingPendingId,
    }));
  }
}

/**
 * Fire-and-forget call after a successful first exchange. Asks the same
 * provider for a 6-12 character session title. If anything goes wrong we
 * silently keep the heuristic fallback already written by writeSession.
 */
async function maybeGenerateTitle(args: {
  sessionId: string;
  mode: ModeId;
  apiConfig: ApiConfig;
  modelId: string;
}): Promise<void> {
  const state = useAppStore.getState();
  const session = state.sessions.find((s) => s.id === args.sessionId);
  if (!session) return;
  // Only generate once — after the first successful turn the title is the
  // heuristic truncation of user text. Skip if it's been customized.
  const firstUser = session.messages.find((m) => m.role === "user");
  const firstAssistant = session.messages.find(
    (m) => m.role === "assistant" && !m.error,
  );
  if (!firstUser || !firstAssistant) return;
  const fallback = (() => {
    const s = firstUser.content.trim();
    return s.length > 40 ? s.slice(0, 38) + "…" : s;
  })();
  if (session.title !== fallback) return; // already customized/generated

  const model = resolveModel(
    args.apiConfig.provider,
    args.modelId,
    args.apiConfig.modelOverride,
  );
  const sample = (firstUser.content + "\n\n" + firstAssistant.content).slice(
    0,
    1200,
  );
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: args.apiConfig.provider,
        apiKey: args.apiConfig.apiKey,
        baseURL: args.apiConfig.baseURL,
        model,
        system:
          "你是会话命名助手。读取一段用户提问和 AI 回答，输出一个 6-14 个汉字（或等长英文）的标题，概括话题核心。直接输出标题文本，不要引号、不要解释、不要标点结尾。",
        messages: [{ role: "user", content: sample }],
      }),
    });
    if (!res.ok || !res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const { displayText } = stripUsageTrailer(raw);
    const title = displayText
      .replace(/^["'`「『]+|["'`」』。．!？!?\s]+$/g, "")
      .trim()
      .slice(0, 28);
    if (!title || title.length < 2) return;
    // Re-read latest messages; another turn may have already streamed.
    const latest = useAppStore.getState();
    if (latest.currentSessionId !== args.sessionId) return;
    await writeSession({
      sessionId: args.sessionId,
      mode: args.mode,
      messages: latest.messages,
      titleOverride: title,
    });
  } catch {
    // Title is best-effort — never surface to the user.
  }
}

async function writeSession(input: {
  sessionId: string;
  mode: ModeId;
  messages: Message[];
  titleOverride?: string;
}): Promise<void> {
  // `pending: true` placeholders are UI-only loading bubbles — never persist.
  // Error stubs (`⚠️ ...`) shouldn't pollute future API context either.
  const clean = input.messages.filter((m) => !m.pending && !m.error);
  const firstUser = clean.find(
    (m) => m.role === "user" && m.content.trim(),
  );
  if (!firstUser) return;
  const titleSource = firstUser.content.trim();
  const fallbackTitle =
    titleSource.length > 40 ? titleSource.slice(0, 38) + "…" : titleSource;
  const state = useAppStore.getState();
  const existing = state.sessions.find((s) => s.id === input.sessionId);
  // Title precedence: explicit override > existing > heuristic fallback.
  // This way later persists never clobber a generated/edited title.
  const title = input.titleOverride ?? existing?.title ?? fallbackTitle;
  const now = Date.now();
  const session: Session = {
    id: input.sessionId,
    mode: input.mode,
    title,
    messages: clean,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  try {
    await upsertSession(session);
    useAppStore.setState((s) => {
      const without = s.sessions.filter((x) => x.id !== session.id);
      return { sessions: [session, ...without] };
    });
  } catch (err) {
    // Persistence is best-effort — never crash the UI for a write failure.
    console.error("[session persist]", err);
  }
}

async function persistCurrentSession(): Promise<void> {
  const { currentSessionId, chatMode, messages } = useAppStore.getState();
  if (!currentSessionId) return;
  await writeSession({
    sessionId: currentSessionId,
    mode: chatMode,
    messages,
  });
}

async function scrubStalePendingMessages(
  sessions: Session[],
): Promise<Session[]> {
  const result: Session[] = [];
  for (const s of sessions) {
    if (!s.messages.some((m) => m.pending)) {
      result.push(s);
      continue;
    }
    const cleaned: Session = {
      ...s,
      messages: s.messages.filter((m) => !m.pending),
    };
    try {
      await upsertSession(cleaned);
    } catch (err) {
      console.error("[scrub stale pending]", err);
    }
    result.push(cleaned);
  }
  return result;
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
  const live = msgs.filter(
    (m) => !m.pending && !m.error && fullText(m).trim(),
  );
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
