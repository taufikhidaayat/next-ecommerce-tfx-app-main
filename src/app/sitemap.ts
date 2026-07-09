import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/lib/i18n";

const BASE_URL = "https://www.langgananku.store";

// Halaman publik (relatif terhadap root locale). Halaman privat
// (profile, orders, login, dll) sengaja tidak dimasukkan.
const PUBLIC_PATHS = ["", "/products", "/categories", "/brands"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_PATHS.map((path) => {
    // hreflang alternates untuk tiap bahasa (id/en/jv)
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${BASE_URL}/${locale}${path}`;
    }

    return {
      url: `${BASE_URL}/${defaultLocale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.8,
      alternates: { languages },
    };
  });
}
