// Map the app's locales (id, en, jv) to BCP-47 tags for Intl. Date formatting
// for Javanese is unreliable across runtimes, so fall back to Indonesian.
const LOCALE_TO_BCP47: Record<string, string> = {
  id: "id-ID",
  en: "en-US",
  jv: "id-ID",
};

export const formatDateAndTimeForUser = (
  date: string | undefined,
  locale: string = "id",
) => {
  if (!date) return "N/A";

  const bcp47 = LOCALE_TO_BCP47[locale] ?? "id-ID";
  const parsed = new Date(date);

  const datePart = new Intl.DateTimeFormat(bcp47, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);

  const timePart = new Intl.DateTimeFormat(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Jakarta",
  }).format(parsed);

  // Join the parts ourselves so the locale's date-time connector word is not
  // inserted (e.g. "pukul" in Indonesian, "at" in English).
  return `${datePart} • ${timePart}`;
};
