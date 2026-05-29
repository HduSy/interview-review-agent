import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.APP_ORIGIN ?? "https://findfunplus.cn";

const DESCRIPTION =
  "OC-Review 是 AI Native 面试助手：在浏览器里完成模拟面试、面试复盘、STAR 法则评分与改写、高频题目预测、答案优化。无需注册，自带画像与简历上下文，API Key 仅存本地。支持 Claude / GPT / Gemini / 智谱 等多供应商切换。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OC-Review · AI Native 面试助手",
    template: "%s · OC-Review",
  },
  description: DESCRIPTION,
  keywords: [
    "AI 面试",
    "AI 面试助手",
    "模拟面试",
    "面试复盘",
    "STAR 法则",
    "行为面",
    "技术面",
    "答案优化",
    "面试题预测",
    "Claude",
    "GPT",
    "Gemini",
    "智谱",
    "AI Native",
    "OC-Review",
  ],
  authors: [{ name: "OC-Review" }],
  applicationName: "OC-Review",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "OC-Review",
    title: "OC-Review · AI Native 面试助手",
    description: DESCRIPTION,
    // /opengraph-image is auto-served by app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "OC-Review · AI Native 面试助手",
    description: DESCRIPTION,
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=EB+Garamond:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
