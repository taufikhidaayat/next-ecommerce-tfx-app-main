import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

type Messages = Record<string, unknown>;

// Deep-merge so keys missing in a locale fall back to the base (default-locale)
// messages instead of throwing MISSING_MESSAGE. We only fully maintain id + en;
// the other languages are partial and rely on this fallback.
function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overrideVal = override[key];
    if (
      baseVal &&
      overrideVal &&
      typeof baseVal === 'object' &&
      typeof overrideVal === 'object' &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(baseVal as Messages, overrideVal as Messages);
    } else {
      result[key] = overrideVal;
    }
  }
  return result;
}

async function loadMessages(locale: Locale): Promise<Messages> {
  return (await import(`./messages/${locale}.json`)).default;
}

export default getRequestConfig(async ({ locale }) => {
  const finalLocale: Locale =
    locale && locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  const localeMessages = await loadMessages(finalLocale);

  // For non-default locales, fill any gaps with the default locale's messages.
  const messages =
    finalLocale === defaultLocale
      ? localeMessages
      : deepMerge(await loadMessages(defaultLocale), localeMessages);

  return {
    locale: finalLocale,
    messages,
  };
});
