import type { MetadataRoute } from "next";

const SITE_URL = process.env.APP_ORIGIN ?? "https://findfunplus.cn";

/**
 * 站点目前只有一个可索引页面 — 聊天本身是用户私密数据（仅存 IndexedDB），
 * 不存在可被爬取的 URL 列表。所以 sitemap 只暴露落地页。新增可索引页面
 * （博客 / FAQ / 引导文档）时往这里加。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
