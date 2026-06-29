import { Shell } from "@/components/shell";

// /zh serves Chinese. Mirror of the root page with the locale fixed to zh;
// middleware stamps x-oc-locale=zh so the layout renders <html lang="zh-Hans">
// and the zh canonical / metadata.
export default function ZhPage() {
  return <Shell initialLocale="zh" />;
}
