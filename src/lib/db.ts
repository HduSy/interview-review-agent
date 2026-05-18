import Dexie, { type Table } from "dexie";
import { PROVIDER_DEFAULT_URL, type Provider } from "./providers";

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

class OcReviewDB extends Dexie {
  profiles!: Table<Profile, string>;
  apiConfigs!: Table<ApiConfig, string>;
  resumes!: Table<ResumeBlob, string>;
  usage!: Table<UsageRecord, number>;

  constructor() {
    super("oc-review");
    this.version(1).stores({
      profiles: "id",
      apiConfigs: "id",
      resumes: "id",
      usage: "++id, ts, model",
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
  return db.usage.orderBy("ts").reverse().limit(200).toArray();
}
