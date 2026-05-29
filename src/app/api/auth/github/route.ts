import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

const STATE_COOKIE = "oc_oauth_state";
const STATE_MAX_AGE = 600; // 10 minutes — only needs to survive the round-trip

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID not configured" },
      { status: 500 },
    );
  }

  // Behind a reverse proxy `req.url` reflects the proxy's internal address
  // (e.g. http://localhost:3000), which leaks into the redirect_uri and
  // makes GitHub reject the callback. Production must set APP_ORIGIN
  // (e.g. https://findfunplus.cn); local dev falls back to req.url which
  // is correct when hitting Next directly.
  const origin = process.env.APP_ORIGIN ?? new URL(req.url).origin;
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/github/callback`,
    scope: "read:user",
    state,
  });

  const res = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    // Match the public scheme — `secure: true` on plain HTTP makes browsers
    // silently drop the cookie (and then state validation fails downstream).
    secure: origin.startsWith("https:"),
    maxAge: STATE_MAX_AGE,
    path: "/",
  });
  return res;
}
