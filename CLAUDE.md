# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install      # one-time
pnpm dev          # next dev (Turbopack) → http://localhost:3000
pnpm build        # next build (also catches type errors)
pnpm start        # serve the built output
```

No lint or test scripts are wired up. Type errors only surface on `pnpm build` or in the editor.

## Architecture overview

OC-Review is a single-page chat UI with no backend persistence. Everything user-specific lives in IndexedDB; the Next.js API routes only proxy provider HTTP calls (and never persist anything).

### Two orthogonal state axes

`PRD.md` mandates that **slash commands and sidebar navigation do not affect each other**. The store encodes this as two independent fields:

- `view`: what panel renders on the right — either `{ kind: "chat" }` (Welcome / ModeView) or `{ kind: "history"; mode }` (HistoryView).
- `chatMode`: which mode the *current chat* runs in (`chat | mock | review | practice | predict | optimize`). Affects only the system prompt and which rich payload is rendered, not navigation.

`activateChatMode` (from the slash palette) updates `chatMode` and forces `view: chat` but does **not** change which sidebar item appears highlighted. `selectSidebarMode` (from Rail / ExpandedSidebar) updates `view` and does **not** touch `chatMode`. Keep these two flows separated when adding features.

### Rich messages, not a chat-bubble + side-panel

`Message` carries optional `payload` of type `ReviewFeedback | PracticeQuestion | PredictSession | OptimizeDiff` ([`src/lib/messages.ts`](src/lib/messages.ts)). `MessageList` renders the text first, then dispatches the payload to `ModeCard` ([`src/components/mode-cards.tsx`](src/components/mode-cards.tsx)). The four mode-specific cards live there; do not put them inline elsewhere.

When the user has **no API key**, `sendUserMessage` attaches a hard-coded demo payload from [`src/lib/demo-payloads.ts`](src/lib/demo-payloads.ts) so the rich cards still demo. Once a key is configured, the payload field is left empty and AI text streams in instead.

### AI flow and provider abstraction

```
Composer.handleSubmit
  → store.sendUserMessage(text)
    → if apiKey: streamReply() → POST /api/chat → for-await fullStream
      → incrementally set message.content
    → else: setTimeout 600ms + attach demo payload
```

[`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) constructs a provider factory **per request** (`createAnthropic`, `createOpenAI`, `createGoogleGenerativeAI`) from the body's `apiKey + baseURL`. The factory is then discarded; nothing about the key lives past the request handler.

**OpenAI-compatible providers (zhipu/custom/azure-openai) must use `factory.chat(model)`, not `factory(model)`.** The default `factory(model)` targets OpenAI's Responses API at `/responses`, which third parties don't implement (returns 404). `.chat(model)` targets `/chat/completions`.

### Stream parsing gotcha

When iterating `result.fullStream`, the runtime emits `text-delta` parts with a **`text`** field even though the `.d.ts` declares **`delta`**. Always coalesce both: `(part as any).delta ?? (part as any).text`. The `error` part type carries the upstream error; surface it inline as `⚠️ ...` rather than letting it close the stream silently — `result.toTextStreamResponse()` swallows these, which is why we hand-roll the `ReadableStream` instead.

### Anthropic message format invariants

Before sending to `/api/chat`, [`normalizeForApi`](src/lib/store.ts) in store.ts enforces:
1. Drop pending and empty messages.
2. Strip any leading assistant messages (Anthropic requires `messages[0].role === "user"`).
3. Collapse consecutive same-role messages into one with `\n\n` separator (Anthropic requires strict alternation).

The system prompt covers what the intro assistant message would say, so dropping it is lossless. If you add new flows that send to `/api/chat`, route them through this normalizer.

### Settings ↔ IndexedDB

[`src/lib/db.ts`](src/lib/db.ts) defines a Dexie schema (`profiles`, `apiConfigs`, `resumes`, `usage`). `Shell` calls `hydrate()` on mount to load `profile` and `apiConfig` into the zustand store. **Before hydration completes, the store has `DEFAULT_API_CONFIG.apiKey = ""`**, which means the demo / placeholder flow runs. If you need real AI to work in the very first paint, you'd need to gate `sendUserMessage` on `hydrated`.

Provider switching has special handling in `changeProvider`: it auto-fills `baseURL` from `PROVIDER_DEFAULT_URL` only when the user hasn't customized it (i.e. current URL is empty or matches one of the known provider defaults). This preserves user-set proxies across provider toggles.

### Dynamic model list

[`src/app/api/models/route.ts`](src/app/api/models/route.ts) calls each provider's models endpoint with the right auth shape:
- Anthropic: `x-api-key` header + `anthropic-version: 2023-06-01`
- Google: `?key=` query param (no header)
- OpenAI / Zhipu / Azure / Custom: `Authorization: Bearer`

Returned models populate `availableModels` in the store. `ModelPicker` ([`src/components/model-picker.tsx`](src/components/model-picker.tsx)) prefers `availableModels` and falls back to the hard-coded `DEFAULT_MODEL + MORE_MODELS` from [`src/lib/models.ts`](src/lib/models.ts) when empty. When the user's currently selected `modelId` isn't in a newly fetched list, the store auto-switches to the first model.

## Zustand patterns to keep

- Components subscribe with single-field selectors (`useAppStore((s) => s.x)`), not destructured whole-state. The ModelPicker's open/close state is in the store specifically to avoid a class of "stale closure swallows click" bugs when popovers unmount mid-event.
- All UI clicks that close the picker also use `onPointerDown` + `e.preventDefault()` so the selection commits **before** any outside-click handler can race.
- Action functions taking optional arguments (`openSettings(tab?)`, etc.) **must not** be passed bare to `onClick={openSettings}` — React will pass the `MouseEvent` as the first arg, which then becomes the `settingsTab` value. Always wrap: `onClick={() => openSettings()}`.

## Design system

All colors, type sizes, radii, spacing are tokens in [`src/app/globals.css`](src/app/globals.css) — `@theme` block. Refer to `DESIGN.md` for the design intent (cream canvas, coral CTAs, Copernicus serif headlines, dark navy product cards). The Tailwind tokens map directly: `bg-canvas`, `text-ink`, `border-hairline`, `text-primary`, etc. Don't introduce ad-hoc hex values.

Serif display headlines must use `style={{ fontFamily: "var(--font-serif)" }}` inline — there's no Tailwind utility wired for it. Body text gets sans by default.

## Out-of-scope things to know

- No auth, no cloud sync, no multi-user. PRD calls these out as MVP non-goals.
- The `claude-design-files/` directory holds the original React design canvas (`.jsx` files) for reference when matching screens to layouts. Not part of the runtime bundle.
- `usage` Dexie table exists but isn't populated yet — Phase 6 left it as a placeholder. To wire it, capture `result.usage` from `streamText` in the API route and POST it back to a client-side accumulator.
