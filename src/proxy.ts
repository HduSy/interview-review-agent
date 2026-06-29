import { NextResponse, type NextRequest } from "next/server";

/**
 * URL path is the source of truth for locale (SEO-crawlable):
 *   /zh, /zh/...  → Chinese
 *   everything else (root `/`) → English (x-default)
 *
 * Googlebot crawls from US IPs without cookies or Accept-Language, so the
 * locale must be derivable from the URL alone. We stamp the resolved locale
 * onto a request header (`x-oc-locale`) that the root layout reads to set
 * <html lang>, canonical, and hreflang — the layout has no segment param of
 * its own, so this header is how it learns the path's language.
 */
export function proxy(req: NextRequest) {
  const isZh =
    req.nextUrl.pathname === "/zh" || req.nextUrl.pathname.startsWith("/zh/");
  const locale = isZh ? "zh" : "en";

  const headers = new Headers(req.headers);
  headers.set("x-oc-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip API, Next internals, metadata routes, and anything with a file
  // extension (icons, og image, robots, sitemap, manifest, static assets).
  matcher: [
    "/((?!api|_next/static|_next/image|icon|apple-icon|opengraph-image|.*\\.).*)",
  ],
};
