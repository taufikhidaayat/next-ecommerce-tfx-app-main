import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { WEB_APP_NAME, WEB_APP_NAME_DESCRIPTION } from "@/lib/constant";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.langgananku.store"),
  title: WEB_APP_NAME,
  description: WEB_APP_NAME_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-tl-square.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo-tl-square.png",
  },
  openGraph: {
    type: "website",
    url: "https://www.langgananku.store",
    title: WEB_APP_NAME,
    description: WEB_APP_NAME_DESCRIPTION,
    siteName: WEB_APP_NAME,
    images: [
      {
        url: "/images/logo-tl-square.png",
        width: 512,
        height: 512,
        alt: WEB_APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: WEB_APP_NAME,
    description: WEB_APP_NAME_DESCRIPTION,
    images: ["/images/logo-tl-square.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.langgananku.store/#organization",
      name: WEB_APP_NAME,
      url: "https://www.langgananku.store",
      logo: "https://www.langgananku.store/images/logo-tl-square.png",
      description: WEB_APP_NAME_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": "https://www.langgananku.store/#website",
      name: WEB_APP_NAME,
      url: "https://www.langgananku.store",
      publisher: { "@id": "https://www.langgananku.store/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={montserrat.variable}>
      <body className="antialiased bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
