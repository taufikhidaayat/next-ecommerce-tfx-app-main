import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[calc(100vh-64px)] px-6 py-10">
      <div className="max-w-screen-xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-14 px-2 md:px-6">
        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <Image
            src="/images/not-found.png"
            alt={t("imageAlt")}
            width={220}
            height={220}
            className="object-contain w-full max-w-[120px] sm:max-w-[220px]"
          />
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 leading-snug">
            {t("title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-5 leading-relaxed">
            {t("desc")}
          </p>

          <Link
            href="/"
            className="inline-block px-4 py-2 text-white bg-green-700 rounded-md font-medium text-sm transition hover:bg-green-600 hover:scale-[1.03]"
          >
            {t("backToDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}