import type { MetadataRoute } from "next";

const SITE_URL = process.env.APP_ORIGIN ?? "https://findfunplus.cn";

/**
 * Two indexable URLs — the English root (x-default) and the Chinese /zh.
 * Each entry carries the full hreflang cluster (including itself + x-default)
 * via `alternates.languages`. Note Next does NOT auto-add the self-referencing
 * <xhtml:link>, so both locales are listed explicitly on every entry.
 *
 * The chat itself is private (IndexedDB only) — no crawlable URL list — so the
 * sitemap stays at the two landing variants. Add future indexable pages here.
 */
const languages = {
  en: `${SITE_URL}/`,
  "zh-Hans": `${SITE_URL}/zh`,
  "x-default": `${SITE_URL}/`,
};

/**
 * Last meaningful change to the landing copy. Google treats <lastmod> as a
 * freshness HINT and discounts values that change on every deploy without a
 * real content change — so this is a stable date, NOT `new Date()` at build
 * time (which would always report "today" and carry no signal). Bump it when
 * the marketing copy on `/` or `/zh` actually changes. The two mirrors share
 * one date because the locales change together.
 */
const LAST_UPDATED = new Date("2026-06-30");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
