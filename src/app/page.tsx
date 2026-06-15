import { cookies } from "next/headers";
import { Shell } from "@/components/shell";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale";

export default async function Page() {
  // Read the locale cookie server-side and hand it to the client tree as a
  // prop. Note: the store can't be seeded from here — Next gives Server and
  // Client Components separate module graphs, so the store instance this file
  // imports is NOT the one the client components use. Shell (client graph)
  // does the seeding before its children read `locale`.
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  const initialLocale: Locale = v === "zh" || v === "en" ? v : DEFAULT_LOCALE;
  return <Shell initialLocale={initialLocale} />;
}
