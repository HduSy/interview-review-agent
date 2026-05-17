import type { Provider } from "./db";

const ANTHROPIC_MAP: Record<string, string> = {
  "sonnet-4.6": "claude-sonnet-4-6",
  "opus-4.7": "claude-opus-4-7",
  "haiku-4.5": "claude-haiku-4-5-20251001",
  "opus-4.6": "claude-opus-4-6",
  "opus-3": "claude-3-opus-20240229",
  "sonnet-4.5": "claude-sonnet-4-5",
};

const OPENAI_MAP: Record<string, string> = {
  "sonnet-4.6": "gpt-4.1",
  "opus-4.7": "gpt-4.1",
  "haiku-4.5": "gpt-4.1-mini",
  "opus-4.6": "gpt-4.1",
  "opus-3": "gpt-4o",
  "sonnet-4.5": "gpt-4o",
};

const GOOGLE_MAP: Record<string, string> = {
  "sonnet-4.6": "gemini-2.5-pro",
  "opus-4.7": "gemini-2.5-pro",
  "haiku-4.5": "gemini-2.5-flash",
  "opus-4.6": "gemini-2.5-pro",
  "opus-3": "gemini-1.5-pro",
  "sonnet-4.5": "gemini-2.0-flash",
};

const ZHIPU_MAP: Record<string, string> = {
  "sonnet-4.6": "glm-4-plus",
  "opus-4.7": "glm-4-plus",
  "haiku-4.5": "glm-4-flash",
  "opus-4.6": "glm-4",
  "opus-3": "glm-4",
  "sonnet-4.5": "glm-4-air",
};

export function resolveModel(
  provider: Provider,
  selectedId: string,
  override?: string,
): string {
  if (override?.trim()) return override.trim();
  switch (provider) {
    case "anthropic":
      return ANTHROPIC_MAP[selectedId] ?? "claude-sonnet-4-6";
    case "openai":
    case "azure-openai":
      return OPENAI_MAP[selectedId] ?? "gpt-4.1";
    case "google":
      return GOOGLE_MAP[selectedId] ?? "gemini-2.5-pro";
    case "zhipu":
      return ZHIPU_MAP[selectedId] ?? "glm-4-plus";
    case "custom":
      return selectedId;
  }
}
