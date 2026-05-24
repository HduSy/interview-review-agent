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
  zhipu: "https://open.bigmodel.cn/api/coding/paas/v4",
  "azure-openai": "",
  custom: "",
};

/**
 * `custom` may proxy either an OpenAI-compatible or an Anthropic-compatible
 * upstream. Disambiguate by sniffing the baseURL — anything containing
 * "anthropic" is treated as Anthropic, otherwise OpenAI Chat Completions.
 */
export function resolveWireProtocol(
  provider: Provider,
  baseURL?: string,
): "anthropic" | "openai" | "google" {
  if (provider === "anthropic") return "anthropic";
  if (provider === "google") return "google";
  if (provider === "custom" && baseURL && /anthropic/i.test(baseURL)) {
    return "anthropic";
  }
  return "openai";
}

/**
 * Anthropic-compatible proxies (Zhipu /api/anthropic, DeepSeek /anthropic,
 * etc.) all expect requests under a versioned subpath. The Anthropic SDK
 * appends `/messages` directly to the baseURL, so without `/v1` the call
 * 404s. Normalize once at the entry point so users can paste either form.
 */
export function normalizeAnthropicBaseURL(baseURL: string): string {
  const trimmed = baseURL.replace(/\/$/, "");
  return /\/v\d+$/.test(trimmed) ? trimmed : `${trimmed}/v1`;
}
