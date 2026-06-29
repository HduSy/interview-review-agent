import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Cormorant_Garamond, EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { MESSAGES } from "@/lib/i18n/messages";

const SITE_URL = process.env.APP_ORIGIN ?? "https://findfunplus.cn";

// Self-hosted via next/font: fonts are downloaded at build time and served
// from /_next/static, so there's no render-blocking request to fonts.googleapis
// and no layout shift. Each exposes a CSS variable consumed by globals.css.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-eb-garamond",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const fontVars = `${inter.variable} ${cormorant.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`;

/** Locale for this request, derived from the URL path by middleware. */
async function requestLocale(): Promise<Locale> {
  const v = (await headers()).get("x-oc-locale");
  return v === "zh" || v === "en" ? v : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const m = MESSAGES[locale].meta;
  const canonical = locale === "zh" ? "/zh" : "/";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: m.titleDefault,
      template: m.titleTemplate,
    },
    description: m.description,
    keywords: [...m.keywords],
    authors: [{ name: "OC-Review" }],
    applicationName: "OC-Review",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    alternates: {
      canonical,
      // hreflang cluster — every variant lists itself + the others + x-default,
      // so the pair is reciprocal (Google drops one-directional pairs).
      languages: {
        en: "/",
        "zh-Hans": "/zh",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: m.ogLocale,
      url: canonical,
      siteName: "OC-Review",
      title: m.titleDefault,
      description: m.description,
      // /opengraph-image is auto-served by app/opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: m.titleDefault,
      description: m.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    // 国内搜索引擎的站长验证 meta 一般在站长平台拿到验证字符串后填进去。
    // verification: { other: { "baidu-site-verification": "...", "msvalidate.01": "...", "google-site-verification": "..." } },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await requestLocale();
  const m = MESSAGES[locale].meta;
  const htmlLang = m.htmlLang;
  const canonical = locale === "zh" ? `${SITE_URL}/zh` : `${SITE_URL}/`;

  // schema.org structured data — makes the app eligible for rich results and
  // gives crawlers an explicit entity to attach to. Locale-aware so name /
  // description / inLanguage match the served language.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: canonical,
        name: "OC-Review",
        description: m.description,
        inLanguage: htmlLang,
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: "OC-Review",
        url: SITE_URL,
        logo: `${SITE_URL}/apple-icon`,
      },
      {
        "@type": "WebApplication",
        name: m.titleDefault,
        url: canonical,
        description: m.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript.",
        inLanguage: htmlLang,
        publisher: { "@id": `${SITE_URL}/#org` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
      },
    ],
  };

  return (
    <html lang={htmlLang} className={`h-full antialiased ${fontVars}`}>
      <head>
        <meta httpEquiv="content-language" content={htmlLang} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
