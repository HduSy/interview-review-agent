import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

const STATE_COOKIE = "oc_oauth_state";
const USER_COOKIE = "oc_user";
const USER_MAX_AGE = 3 * 24 * 60 * 60; // 3 days

type GithubUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get(STATE_COOKIE)?.value;

  // Fail safely back to home — UI just stays in "未登录" state.
  function bounce(reason?: string) {
    const res = NextResponse.redirect(url.origin + (reason ? `/?auth_error=${reason}` : "/"));
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return bounce("state_mismatch");
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return bounce("not_configured");
  }

  // Exchange code → access_token
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${url.origin}/api/auth/github/callback`,
      }),
    });
    if (!tokenRes.ok) return bounce("token_http");
    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };
    if (!tokenData.access_token) return bounce(tokenData.error || "no_token");
    accessToken = tokenData.access_token;
  } catch {
    return bounce("token_fetch");
  }

  // Fetch /user — we only persist a small subset, never the access_token itself.
  let user: GithubUserResponse;
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "oc-review",
      },
    });
    if (!userRes.ok) return bounce("user_http");
    user = (await userRes.json()) as GithubUserResponse;
  } catch {
    return bounce("user_fetch");
  }

  const payload = JSON.stringify({
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
  });

  const res = NextResponse.redirect(url.origin + "/");
  res.cookies.set(USER_COOKIE, payload, {
    httpOnly: true,
    sameSite: "lax",
    // Honor the actual request protocol — `secure: true` on an HTTP site
    // makes browsers silently drop the cookie. The payload is public
    // GitHub profile data, not credentials.
    secure: url.protocol === "https:",
    maxAge: USER_MAX_AGE,
    path: "/",
  });
  res.cookies.delete(STATE_COOKIE);
  return res;
}
