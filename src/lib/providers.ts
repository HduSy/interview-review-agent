/**
 * Provider identity + URL defaults — kept in their own module (no Dexie)
 * so they can be imported from the edge-runtime API routes safely.
 */

export type Provider =
  | "anthropic"
  | "openai"
  | "google"
  | "zhipu"
  | "azure-openai"
  | "custom";

export const PROVIDER_DEFAULT_URL: Record<Provider, string> = {
  anthropic: "https://api.anthropic.com/v1",
  openai: "https://api.openai.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  zhipu: "https://open.bigmodel.cn/api/paas/v4",
  "azure-openai": "",
  custom: "",
};
