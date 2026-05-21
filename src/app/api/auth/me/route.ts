import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge";

const USER_COOKIE = "oc_user";

export type GithubUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
};

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(USER_COOKIE)?.value;
  if (!cookie) return NextResponse.json({ user: null });
  try {
    const user = JSON.parse(cookie) as GithubUser;
    if (typeof user?.login !== "string") return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
