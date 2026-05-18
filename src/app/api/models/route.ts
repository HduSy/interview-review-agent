import { PROVIDER_DEFAULT_URL, type Provider } from "@/lib/providers";

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

  switch (body.provider) {
    case "anthropic": {
      const r = await fetch(`${base}/models?limit=200`, {
        headers: {
          "x-api-key": body.apiKey,
          "anthropic-version": "2023-06-01",
        },
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      const data = (await r.json()) as {
        data: { id: string; display_name?: string }[];
      };
      return data.data.map((m) => ({ id: m.id, name: m.display_name || m.id }));
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

    case "openai":
    case "zhipu":
    case "azure-openai":
    case "custom": {
      const r = await fetch(`${base}/models`, {
        headers: { Authorization: `Bearer ${body.apiKey}` },
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      const data = (await r.json()) as { data?: { id: string }[] };
      const list = Array.isArray(data.data) ? data.data : [];
      return list.map((m) => ({ id: m.id, name: m.id }));
    }
  }
}
