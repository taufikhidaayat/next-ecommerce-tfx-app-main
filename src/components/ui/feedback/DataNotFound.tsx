import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

type StateIndicatorProps = {
  notFoundImage?: string;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export const DataNotFound = (props: StateIndicatorProps) => {
  const {
    notFoundImage = '/images/data-not-found.png',
    title,
    description,
    action,
    className,
  } = props;

  const t = useTranslations("feedback.notFound");

  return (
    <div
      className={
        className ||
        "flex flex-col items-center justify-center bg-white/80 border border-green-200 rounded-2xl shadow-md p-6 text-gray-700"
      }
    >
      {/* Image Section */}
      <div className="mb-3">
        <Image
          src={notFoundImage}
          alt={t("alt")}
          width={160}
          height={160}
          priority
          className="w-full max-w-[110px] sm:max-w-[160px]"
        />
      </div>

      {/* Text Section */}
      <div className="text-center max-w-md">
        <h1 className="text-lg sm:text-xl font-bold text-green-700 mb-1">
          {title ?? t("title")}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {description ?? t("desc")}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
