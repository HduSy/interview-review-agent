"use client";

import { useAppStore } from "@/lib/store";
import { MESSAGES, type Messages } from "./messages";

/**
 * Reactive dictionary hook. Returns the message object for the active
 * locale; components re-render when the user switches language because
 * they subscribe to `locale` in the store.
 *
 * Usage: `const t = useT(); ... {t.common.done}` or `{t.welcome.title1}`.
 * Interpolated strings are functions: `{t.history.matchEmpty(query)}`.
 */
export function useT(): Messages {
  const locale = useAppStore((s) => s.locale);
  return MESSAGES[locale];
}
