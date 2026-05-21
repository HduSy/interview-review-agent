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

  const origin = new URL(req.url).origin;
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
    // Honor the actual request protocol — `secure: true` on an HTTP site
    // makes browsers silently drop the cookie.
    secure: req.nextUrl.protocol === "https:",
    maxAge: STATE_MAX_AGE,
    path: "/",
  });
  return res;
}
