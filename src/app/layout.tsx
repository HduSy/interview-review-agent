import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale";
import { MESSAGES } from "@/lib/i18n/messages";

const SITE_URL = process.env.APP_ORIGIN ?? "https://findfunplus.cn";

/** Locale for this request, from the cookie the client sets on switch. */
async function requestLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v === "zh" || v === "en" ? v : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const m = MESSAGES[await requestLocale()].meta;
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
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: m.ogLocale,
      url: "/",
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
  const m = MESSAGES[await requestLocale()].meta;
  const htmlLang = m.htmlLang;

  // schema.org structured data — makes the app eligible for rich results and
  // gives crawlers an explicit entity to attach to. Locale-aware so name /
  // description match the served language. Rendered as a raw <script>, the
  // Next-recommended way to ship JSON-LD (the Metadata API has no field for it).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
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
        url: SITE_URL,
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
    <html lang={htmlLang} className="h-full antialiased">
      <head>
        <meta httpEquiv="content-language" content={htmlLang} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=EB+Garamond:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
