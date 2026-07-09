import dictionaries, {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../locales";
import loadConfig from "./util";

const DEFAULT_LOCALE: SupportedLocale = "en";

export { SUPPORTED_LOCALES, type SupportedLocale };

export function resolveLocale(requestLang?: string): SupportedLocale {
  // 1. query params
  if (
    requestLang &&
    SUPPORTED_LOCALES.includes(requestLang as SupportedLocale)
  ) {
    return requestLang as SupportedLocale;
  }

  // 2. config.json
  const config = loadConfig();
  if (
    config.LANG &&
    SUPPORTED_LOCALES.includes(config.LANG as SupportedLocale)
  ) {
    return config.LANG as SupportedLocale;
  }

  // 3. OS/runtime
  const sysLocale = Intl.DateTimeFormat()
    .resolvedOptions()
    .locale.split("-")[0];
  if (SUPPORTED_LOCALES.includes(sysLocale as SupportedLocale)) {
    return sysLocale as SupportedLocale;
  }

  // 4. default
  return DEFAULT_LOCALE;
}

/**
 * Get translated text on the server
 */
export function t(
  key: string,
  variables?: Record<string, string | number>,
  requestLocale?: string,
): string {
  const locale = resolveLocale(requestLocale);

  let text =
    dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE]?.[key] ?? key;

  if (variables) {
    text = Object.entries(variables).reduce((acc, [key, value]) => {
      return acc.replace(`{${key}}`, String(value));
    }, text);
  }

  return text;
}
