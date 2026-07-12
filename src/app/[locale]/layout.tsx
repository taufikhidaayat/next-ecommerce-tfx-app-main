import LayoutWrapper from '@/components/ui/layout/LayoutWrapper';
import { NextIntlClientProvider } from 'next-intl';

// Layout per-bahasa. URL toko berbentuk /[locale]/... (mis. /id/products, /en/products).
// Layout ini memuat file terjemahan sesuai `locale` di URL, lalu menyediakannya ke
// seluruh halaman lewat NextIntlClientProvider. Kalau bahasa tidak ada, jatuh ke Indonesia.
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Muat teks terjemahan untuk bahasa ini; bila filenya tidak ada, pakai bahasa Indonesia.
  let messages;
  try {
    messages = (await import(`../../i18n/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(error);
    console.error(`Missing messages for locale: ${locale}`);
    messages = (await import(`../../i18n/messages/id.json`)).default;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LayoutWrapper>{children}</LayoutWrapper>
    </NextIntlClientProvider>
  );
}
