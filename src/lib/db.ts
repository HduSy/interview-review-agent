import Dexie, { type Table } from "dexie";
import { PROVIDER_DEFAULT_URL, type Provider } from "./providers";
import type { ModeId } from "./commands";
import type { Message } from "./messages";

export type { Provider };
export { PROVIDER_DEFAULT_URL };

export type Profile = {
  id: "me";
  targetRole: string;
  yearsExp: string;
  techStack: string[];
  targetCompanies: string[];
  resumeBlobId?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  updatedAt: number;
};

export type ApiConfig = {
  id: "default";
  provider: Provider;
  apiKey: string;
  baseURL?: string;
  modelOverride?: string;
  updatedAt: number;
};

export type ResumeBlob = {
  id: string;
  blob: Blob;
};

export type UsageRecord = {
  id?: number;
  ts: number;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
};

export type Session = {
  id: string;
  mode: ModeId;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

class OcReviewDB extends Dexie {
  profiles!: Table<Profile, string>;
  apiConfigs!: Table<ApiConfig, string>;
  resumes!: Table<ResumeBlob, string>;
  usage!: Table<UsageRecord, number>;
  sessions!: Table<Session, string>;

  constructor() {
    super("oc-review");
    this.version(1).stores({
      profiles: "id",
      apiConfigs: "id",
      resumes: "id",
      usage: "++id, ts, model",
    });
    this.version(2).stores({
      profiles: "id",
      apiConfigs: "id",
      resumes: "id",
      usage: "++id, ts, model",
      sessions: "id, mode, updatedAt",
    });
  }
}

export const db = new OcReviewDB();

export const DEFAULT_PROFILE: Profile = {
  id: "me",
  targetRole: "",
  yearsExp: "",
  techStack: [],
  targetCompanies: [],
  updatedAt: 0,
};

export const DEFAULT_API_CONFIG: ApiConfig = {
  id: "default",
  provider: "anthropic",
  apiKey: "",
  baseURL: PROVIDER_DEFAULT_URL.anthropic,
  updatedAt: 0,
};

export async function loadProfile(): Promise<Profile> {
  const p = await db.profiles.get("me");
  return p ?? DEFAULT_PROFILE;
}

export async function saveProfile(patch: Partial<Profile>): Promise<Profile> {
  const current = await loadProfile();
  const next: Profile = { ...current, ...patch, id: "me", updatedAt: Date.now() };
  await db.profiles.put(next);
  return next;
}

export async function loadApiConfig(): Promise<ApiConfig> {
  const c = await db.apiConfigs.get("default");
  return c ?? DEFAULT_API_CONFIG;
}

export async function saveApiConfig(patch: Partial<ApiConfig>): Promise<ApiConfig> {
  const current = await loadApiConfig();
  const next: ApiConfig = { ...current, ...patch, id: "default", updatedAt: Date.now() };
  await db.apiConfigs.put(next);
  return next;
}

export async function saveResume(file: File): Promise<{ id: string; fileName: string; fileSize: number }> {
  const id = `resume-${Date.now()}`;
  await db.resumes.put({ id, blob: file });
  return { id, fileName: file.name, fileSize: file.size };
}

export async function deleteResume(id: string): Promise<void> {
  await db.resumes.delete(id);
}

export async function loadResume(id: string): Promise<Blob | undefined> {
  const r = await db.resumes.get(id);
  return r?.blob;
}

export async function loadUsage(): Promise<UsageRecord[]> {
  return db.usage.orderBy("ts").reverse().limit(500).toArray();
}

export async function recordUsage(r: Omit<UsageRecord, "id">): Promise<void> {
  await db.usage.add(r);
}

export type UsageStats = {
  todayTokens: number;
  monthTokens: number;
  totalCalls: number;
  recentRows: UsageRecord[];
};

export async function loadSessions(): Promise<Session[]> {
  return db.sessions.orderBy("updatedAt").reverse().toArray();
}

export async function loadSessionById(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

export async function upsertSession(s: Session): Promise<void> {
  await db.sessions.put(s);
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

export async function loadUsageStats(): Promise<UsageStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const rows = await loadUsage();
  let todayTokens = 0;
  let monthTokens = 0;
  for (const r of rows) {
    const total = r.promptTokens + r.completionTokens;
    if (r.ts >= startOfDay) todayTokens += total;
    if (r.ts >= startOfMonth) monthTokens += total;
  }
  return {
    todayTokens,
    monthTokens,
    totalCalls: rows.length,
    recentRows: rows.slice(0, 10),
  };
}
