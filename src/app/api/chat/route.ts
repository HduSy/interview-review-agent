import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";
import type { Provider } from "@/lib/providers";

export const runtime = "edge";

type Body = {
  provider: Provider;
  apiKey: string;
  baseURL?: string;
  model: string;
  system: string;
  messages: ModelMessage[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.apiKey?.trim()) {
    return new Response("Missing API key — 在 /settings 填好后再试", { status: 400 });
  }

  try {
    const model = makeModel(body);
    const result = streamText({
      model,
      system: body.system,
      messages: body.messages,
    });

    // Use fullStream (not textStream) so upstream errors arrive as
    // { type: 'error', error } events instead of being silently swallowed.
    // Usage info from the `finish` event is encoded as a trailing sentinel
    // block: {json} — the client strips this before display.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              const p = part as unknown as { delta?: string; text?: string };
              const chunk = p.delta ?? p.text ?? "";
              if (chunk) controller.enqueue(encoder.encode(chunk));
            } else if (part.type === "error") {
              const e = part.error as unknown;
              let msg: string;
              if (e instanceof Error) msg = e.message;
              else if (typeof e === "string") msg = e;
              else if (e && typeof e === "object" && "message" in e)
                msg = String((e as { message: unknown }).message);
              else msg = JSON.stringify(e);
              controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
            } else if (part.type === "finish") {
              const usage = (part as unknown as {
                usage?: {
                  inputTokens?: number;
                  outputTokens?: number;
                  totalTokens?: number;
                };
              }).usage;
              if (usage) {
                const meta = JSON.stringify({
                  type: "usage",
                  model: body.model,
                  inputTokens: usage.inputTokens ?? 0,
                  outputTokens: usage.outputTokens ?? 0,
                });
                controller.enqueue(encoder.encode(`${meta}`));
              }
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          controller.enqueue(encoder.encode(`\n\n⚠️ Upstream: ${msg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Upstream error: ${msg}`, { status: 502 });
  }
}

function makeModel({ provider, apiKey, baseURL, model }: Body) {
  switch (provider) {
    case "anthropic": {
      const factory = createAnthropic({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });
      return factory(model);
    }
    case "openai":
    case "azure-openai":
    case "zhipu":
    case "custom": {
      const factory = createOpenAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });
      // Use the Chat Completions endpoint (/chat/completions) rather than
      // the new Responses API — third-party OpenAI-compatible providers
      // (Zhipu / DeepSeek / Moonshot / Azure) only implement the former.
      return factory.chat(model);
    }
    case "google": {
      const factory = createGoogleGenerativeAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });
      return factory(model);
    }
  }
}
