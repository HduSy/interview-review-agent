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
  loadSession: (id: string) => Promise<void>;
  deleteCurrentSession: () => Promise<void>;

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

  activateChatMode: (id) => {
    if (id === "settings") {
      set({ settingsOpen: true, settingsTab: "profile" });
      return;
    }
    set({ chatMode: id, view: { kind: "chat" } });
    if (id !== "chat") get().appendIntroIfEmpty(id);
    // Sync the session's mode only if it has already been persisted
    // (i.e. a stream completed for this session). Otherwise wait — the
    // initial write comes from streamReply on completion.
    const { currentSessionId, sessions } = get();
    if (currentSessionId && sessions.some((s) => s.id === currentSessionId)) {
      void persistCurrentSession();
    }
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
      currentSessionId: null,
    }),

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

  loadSession: async (id) => {
    const cached = get().sessions.find((s) => s.id === id);
    const session = cached ?? (await loadSessionById(id));
    if (!session) return;
    set({
      view: { kind: "chat" },
      chatMode: session.mode,
      messages: session.messages,
      currentSessionId: session.id,
    });
  },

  deleteCurrentSession: async () => {
    const id = get().currentSessionId;
    if (!id) return;
    await deleteSession(id);
    set((s) => ({
      sessions: s.sessions.filter((x) => x.id !== id),
      messages: [],
      currentSessionId: null,
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
    applyAssistant({ content: "⚠️ 还没有可发送的用户消息" });
    persist();
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
      applyAssistant({ content: `⚠️ ${errText}` });
      persist();
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
      if (partial) {
        applyAssistant({ content: partial.summary, payload: partial.payload });
      } else {
        applyAssistant({ content: displayText, payload: undefined });
      }
    }
    acc += decoder.decode();
    const { displayText: finalText, trailer } = stripUsageTrailer(acc);

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
    applyAssistant({ content: `⚠️ 调用失败：${msg}` });
    persist();
  }
}

async function writeSession(input: {
  sessionId: string;
  mode: ModeId;
  messages: Message[];
}): Promise<void> {
  // `pending: true` placeholders are UI-only loading bubbles — never persist.
  const clean = input.messages.filter((m) => !m.pending);
  const firstUser = clean.find(
    (m) => m.role === "user" && m.content.trim(),
  );
  if (!firstUser) return;
  const titleSource = firstUser.content.trim();
  const title =
    titleSource.length > 40 ? titleSource.slice(0, 38) + "…" : titleSource;
  const state = useAppStore.getState();
  const existing = state.sessions.find((s) => s.id === input.sessionId);
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
