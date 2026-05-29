/**
 * Best-effort vision capability detection by model ID pattern.
 *
 * Why pattern matching: none of the providers we support (Anthropic /
 * OpenAI / Google / Zhipu) expose modality info on their /models endpoints.
 * The id is all we have, so we keep an allowlist of patterns known to
 * accept image input. When a model is in doubt we err on the side of
 * "no vision" — the UX cost of a wrongly-grayed upload button (user
 * switches model) is much smaller than silently dropping image input
 * the server then rejects mid-request.
 *
 * Update this list when adding support for a new provider or when a new
 * vision-capable family ships.
 */
const VISION_PATTERNS: RegExp[] = [
  // Anthropic — Claude 3+ all accept images
  /^claude-3/i,
  /^claude-(?:opus|sonnet|haiku)-\d/i, // claude-opus-4, claude-sonnet-4.5, etc.

  // OpenAI
  /^gpt-4o/i,            // 4o family
  /^gpt-4-turbo/i,       // gpt-4-turbo (1106+) has vision
  /^gpt-4-vision/i,      // legacy explicit
  /^gpt-5/i,             // future-proofing
  /^o[1-9]/i,            // o1 / o3 / o4 reasoning models

  // Google
  /^gemini-1\.5/i,
  /^gemini-2/i,
  /^gemini-(?:pro|flash|ultra).*vision/i,

  // Zhipu — only the explicit -V variants are guaranteed multimodal
  /^glm-4v/i,

  // Generic markers
  /vision/i,
  /-vl(?:-|$)/i,         // qwen-vl, qwen2-vl, etc.
  /multimodal/i,
];

export function modelSupportsVision(modelId: string | undefined | null): boolean {
  if (!modelId) return false;
  return VISION_PATTERNS.some((re) => re.test(modelId));
}
