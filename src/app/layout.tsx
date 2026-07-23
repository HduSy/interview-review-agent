import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Cormorant_Garamond, EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

  // Search-engine site-verification meta. Each token comes from the matching
  // webmaster console (Baidu / Bing / Google) and is deployment-specific, so we
  // read it from env and only emit the tag when the value is set — unset renders
  // no empty <meta>. For a .cn domain, baidu-site-verification is the one that
  // matters most. These land in public HTML, so no NEXT_PUBLIC_ prefix is needed
  // (generateMetadata runs server-side).
  const verification: NonNullable<Metadata["verification"]> = {};
  const other: Record<string, string> = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) verification.google = process.env.GOOGLE_SITE_VERIFICATION;
  if (process.env.BING_SITE_VERIFICATION) other["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;
  if (process.env.BAIDU_SITE_VERIFICATION) other["baidu-site-verification"] = process.env.BAIDU_SITE_VERIFICATION;
  if (Object.keys(other).length > 0) verification.other = other;

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
    // Emits google-site-verification / msvalidate.01 (Bing) /
    // baidu-site-verification <meta> tags only when the matching env var is set
    // (see the build block above). Omitted entirely when nothing is configured.
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
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
        {/* VibeLoft Web Telemetry — loads only from https://vibeloft.ai,
            events only POST to https://api.vibeloft.ai. No CSP exists in
            this project (no vercel.json headers / middleware / _headers),
            so no CSP change is needed per VibeLoft integration rules. */}
        <script
          defer
          src="https://vibeloft.ai/telemetry/v1.js"
          data-vl-product-id="14f2613d-034e-4104-bff6-30c8c5ebd7d0"
          data-vl-auth-key="vl_web.eedznMDj8skfJUWJlzwmQY0PWmaHqmFgpLwXAp5xOis"
        />
      </head>
      <body className="min-h-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
