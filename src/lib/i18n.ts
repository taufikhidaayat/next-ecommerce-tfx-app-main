export const locales = ["id", "en", "jv"] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = "id";

export function stripLocale(pathname: string): string {
    const parts = pathname.split("/");
    const maybeLocale = parts[1] as Locale | undefined;

    if (maybeLocale && locales.includes(maybeLocale)) {
        return "/" + parts.slice(2).join("/");
    }
    return pathname;
}
