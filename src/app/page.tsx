import { Shell } from "@/components/shell";

// Root `/` serves English (the x-default). Chinese lives at /zh.
// Locale is determined by the route, not a cookie, so crawlers index the
// right language without any client signal.
export default function Page() {
  return <Shell initialLocale="en" />;
}
