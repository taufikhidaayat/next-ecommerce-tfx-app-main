import LayoutWrapper from '@/components/ui/layout/LayoutWrapper';
import { NextIntlClientProvider } from 'next-intl';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
