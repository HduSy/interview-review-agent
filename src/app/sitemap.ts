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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
