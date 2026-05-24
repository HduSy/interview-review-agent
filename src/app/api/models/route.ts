import {
  PROVIDER_DEFAULT_URL,
  normalizeAnthropicBaseURL,
  resolveWireProtocol,
  type Provider,
} from "@/lib/providers";

export const runtime = "edge";

type Body = {
  provider: Provider;
  apiKey: string;
  baseURL?: string;
};

export type RemoteModel = { id: string; name: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  if (!body.apiKey?.trim()) {
    return new Response("Missing API key", { status: 400 });
  }
  try {
    const models = await fetchProviderModels(body);
    return Response.json({ models });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(msg, { status: 502 });
  }
}

async function fetchProviderModels(body: Body): Promise<RemoteModel[]> {
  const base = (body.baseURL || PROVIDER_DEFAULT_URL[body.provider]).replace(
    /\/$/,
    "",
  );

  const wire = resolveWireProtocol(body.provider, body.baseURL);
  switch (wire) {
    case "anthropic": {
      // Custom proxies may be missing the conventional /v1 segment that
      // the Anthropic SDK assumes — auto-append so `${base}/models` and
      // `${base}/messages` both land on the right path.
      const anthroBase =
        body.provider === "custom" ? normalizeAnthropicBaseURL(base) : base;
      try {
        const r = await fetch(`${anthroBase}/models?limit=200`, {
          headers: {
            "x-api-key": body.apiKey,
            "anthropic-version": "2023-06-01",
          },
        });
        if (r.ok) {
          const data = (await r.json()) as {
            data?: { id: string; display_name?: string }[];
          };
          const list = Array.isArray(data.data) ? data.data : [];
          if (list.length > 0) {
            return list.map((m) => ({
              id: m.id,
              name: m.display_name || m.id,
            }));
          }
        } else if (body.provider !== "custom") {
          throw new Error(`${r.status} ${await r.text()}`);
        }
      } catch (err) {
        if (body.provider !== "custom") throw err;
        // fall through to OpenAI-style fallback below
      }
      // Fallback for custom proxies whose Anthropic subpath has no /models
      // (e.g. DeepSeek). Strip /anthropic[...] back to the host root and
      // try OpenAI-style listing with Bearer auth.
      const root = base.replace(/\/anthropic(\/.*)?$/i, "");
      return fetchOpenAIStyleModels(root, body.apiKey);
    }

    case "google": {
      const url = `${base}/models?key=${encodeURIComponent(body.apiKey)}&pageSize=200`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      const data = (await r.json()) as {
        models: {
          name: string;
          displayName?: string;
          supportedGenerationMethods?: string[];
        }[];
      };
      return data.models
        .filter((m) =>
          m.supportedGenerationMethods?.includes("generateContent"),
        )
        .map((m) => ({
          id: m.name.replace(/^models\//, ""),
          name: m.displayName || m.name.replace(/^models\//, ""),
        }));
    }

    case "openai": {
      return fetchOpenAIStyleModels(base, body.apiKey);
    }
  }
}

async function fetchOpenAIStyleModels(
  root: string,
  apiKey: string,
): Promise<RemoteModel[]> {
  const r = await fetch(`${root.replace(/\/$/, "")}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const data = (await r.json()) as { data?: { id: string }[] };
  const list = Array.isArray(data.data) ? data.data : [];
  const NON_CHAT =
    /(embedding|whisper|tts|audio|dall-e|moderation|davinci|babbage|search|similarity|edit)/i;
  return list
    .filter((m) => !NON_CHAT.test(m.id))
    .map((m) => ({ id: m.id, name: m.id }));
}
