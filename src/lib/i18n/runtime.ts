import { DEFAULT_LOCALE, type Locale } from "./locale";
import { MESSAGES, type Messages } from "./messages";

/**
 * Module-level mirror of the active locale for NON-React code (the zustand
 * store, prompt builders, output-spec parsers). React components must use
 * the reactive `useT()` hook instead so they re-render on change.
 *
 * The store is the source of truth and calls setActiveLocale whenever the
 * locale changes; this avoids a store→i18n→store import cycle.
 */
let activeLocale: Locale = DEFAULT_LOCALE;

export function setActiveLocale(locale: Locale): void {
  activeLocale = locale;
}

export function getActiveLocale(): Locale {
  return activeLocale;
}

/** Non-reactive dictionary accessor for use outside React. */
export function tt(): Messages {
  return MESSAGES[activeLocale];
}
