import type { MetadataRoute } from "next";

const BASE_URL = "https://www.langgananku.store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Halaman privat / tidak perlu diindeks Google
      disallow: [
        "/api/",
        "/*/login",
        "/*/register",
        "/*/verify",
        "/*/reset-password",
        "/*/profile",
        "/*/orders",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
