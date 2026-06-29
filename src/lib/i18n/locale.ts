export type Locale = "zh" | "en";

export const LOCALES: Locale[] = ["zh", "en"];
// Root `/` serves English and is the x-default; Chinese lives at /zh. So the
// fallback locale (no cookie, no path match) is English.
export const DEFAULT_LOCALE: Locale = "en";

/** Name of the cookie + localStorage key holding the locale choice. */
export const LOCALE_COOKIE = "oc-locale";

function parse(v: string | null | undefined): Locale | null {
  return v === "zh" || v === "en" ? v : null;
}

/** Read the locale cookie synchronously (browser only). */
function cookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)oc-locale=(zh|en)\b/);
  return m ? (m[1] as Locale) : null;
}

function browserLocale(): Locale | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("en")) return "en";
  return null;
}

/**
 * Synchronous, SSR-safe initializer for the store's `locale` field.
 *
 * On the client this runs at module-eval time (before React hydrates) and
 * reads ONLY the cookie — the exact same signal the server reads in
 * app/layout.tsx. That keeps the first client render identical to the
 * server's HTML, so there's no hydration mismatch and no "flash of Chinese"
 * before the stored choice applies. On the server it returns the default;
 * the server resolves the real value from the cookie itself.
 */
export function initialLocale(): Locale {
  return cookieLocale() ?? DEFAULT_LOCALE;
}

/**
 * Fuller resolution used on mount (`hydrate`): cookie > localStorage >
 * browser language > default. The localStorage / browser fallbacks only
 * matter for a first visit with no cookie yet — once the user picks a
 * language, `saveLocale` writes the cookie and this returns it directly.
 */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return (
    cookieLocale() ??
    parse(window.localStorage.getItem(LOCALE_COOKIE)) ??
    browserLocale() ??
    DEFAULT_LOCALE
  );
}

export function saveLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
  // Cookie so the server (metadata + <html lang>) sees the choice on the
  // next request. 1 year, root path, lax — it's a non-sensitive UI pref.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
