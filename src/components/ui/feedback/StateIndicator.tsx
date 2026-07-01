'use client';

import Image from 'next/image';
import { useTranslations } from "next-intl";

type StateIndicatorProps = {
    isLoading?: boolean;
    isError?: boolean;
    loadingMessage?: string;
    errorMessage?: string;
    loadingImage?: string;
    errorImage?: string;
    title?: string;
    description?: string;
    className?: string;
    isOverlay?: boolean;
};

export default function StateIndicator(props: StateIndicatorProps) {
    const {
        isLoading = false,
        isError = false,
        loadingImage = '/images/icons/loading.png',
        errorImage = '/images/icons/something-went-wrong.png',
        title,
        description,
        className = '',
        isOverlay = false,
    } = props;

    const t = useTranslations("feedback.state");

    if (isLoading) {
        const content = (
            <div className={`flex h-full w-full flex-col items-center justify-center gap-3 sm:gap-4 text-center px-6 py-8 pb-24 sm:pb-32 ${className}`}>
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border-[3px] sm:border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <p className="text-gray-800 text-base sm:text-xl font-bold">Mohon Tunggu, Memuat...</p>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm">
                    Kami sedang menyiapkan konten terbaik untuk Anda.
                    Proses ini mungkin membutuhkan beberapa detik.
                    Terima kasih atas kesabaran Anda!
                </p>
            </div>
        );

        return isOverlay ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
                {content}
            </div>
        ) : content;
    }

    if (isError) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center px-4">
                <Image
                    src={errorImage}
                    alt={t("errorAlt")}
                    width={240}
                    height={240}
                    className="mb-6"
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{title ?? t("errorTitle")}</h2>
                <p className="text-sm text-gray-500 max-w-md">{description ?? t("errorDesc")}</p>
            </div>
        );
    }

    return null;
}
