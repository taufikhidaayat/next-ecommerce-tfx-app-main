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
  title: WEB_APP_NAME,
  description: WEB_APP_NAME_DESCRIPTION,
  icons: {
    icon: "/images/logotoko.png",
    shortcut: "/images/logotoko.png",
    apple: "/images/logotoko.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={montserrat.variable}>
      <body className="antialiased bg-white">
        {children}
      </body>
    </html>
  );
}
