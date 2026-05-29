import type { MetadataRoute } from "next";

const SITE_URL = process.env.APP_ORIGIN ?? "https://findfunplus.cn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API 路由是为客户端调用准备的，无 SEO 价值，禁爬节省抓取预算。
        // 鉴权回调更不该被索引。
        disallow: ["/api/", "/?auth_error="],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
