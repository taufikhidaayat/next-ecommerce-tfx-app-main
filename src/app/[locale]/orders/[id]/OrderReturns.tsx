"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiRotateCcw, FiZoomIn, FiX, FiCalendar } from "react-icons/fi";
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { useTranslations } from "next-intl";
import { useReturnsByOrderId } from "@/satelite/services/orderService";

type Props = {
    orderId: string;
};

// Bagian retur di halaman detail order: menampilkan riwayat retur untuk pesanan ini (bila ada).
export default function OrderReturns({ orderId }: Props) {
    const t = useTranslations("orderDetail.returns");
    const { data, isPending, isError } = useReturnsByOrderId(orderId);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!previewUrl) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPreviewUrl(null);
        };
        window.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [previewUrl]);

    const returns = useMemo(() => data?.data ?? [], [data]);

    if (isPending || isError) return null;
    if (returns.length === 0) return null;

    const formatFullDate = (iso: string) =>
        new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const formatRelativeDate = (iso: string): string => {
        const now = new Date();
        const date = new Date(iso);
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return t("today");
        if (diffDays === 1) return t("yesterday");
        if (diffDays < 7) return t("daysAgo", { days: diffDays });
        if (diffDays < 30) return t("weeksAgo", { weeks: Math.floor(diffDays / 7) });
        return t("monthsAgo", { months: Math.floor(diffDays / 30) });
    };

    return (
        <>
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-100 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                            <FiRotateCcw className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                {t("title")}
                            </h2>
                            <p className="text-[11px] sm:text-xs text-green-700 font-medium mt-0.5">
                                {t("itemsCount", { count: returns.length })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="border-l-2 border-green-500/60 bg-green-50/50 pl-3 py-2 rounded-r-md">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                {/* Returns list */}
                <ul className="space-y-3">
                    {returns.map((ret) => {
                        const productName =
                            ret.orderItem.product?.name ?? ret.orderItem.productName;

                        return (
                            <li
                                key={ret.id}
                                className="group relative p-3 sm:p-4 border border-gray-200 rounded-xl bg-white hover:border-green-300 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="flex gap-3 sm:gap-4">
                                    {/* Photo */}
                                    <button
                                        type="button"
                                        onClick={() => setPreviewUrl(ret.photoUrl)}
                                        aria-label={t("viewPhoto")}
                                        className="relative shrink-0 rounded-lg overflow-hidden border border-gray-200 group/photo focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <Image
                                            src={ret.photoUrl}
                                            alt={productName}
                                            width={84}
                                            height={84}
                                            className="w-20 h-20 sm:w-[84px] sm:h-[84px] object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                                            <FiZoomIn className="w-5 h-5 text-white drop-shadow" />
                                        </div>
                                    </button>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                                                {productName}
                                            </h3>
                                            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold tabular-nums">
                                                ×{ret.quantity}
                                            </span>
                                        </div>

                                        {/* Reason quote */}
                                        <div className="mt-2 flex gap-1.5">
                                            <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-2">
                                                &ldquo;{ret.reason}&rdquo;
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                                            <FiCalendar className="w-3 h-3" />
                                            <time
                                                dateTime={ret.createdAt}
                                                title={formatFullDate(ret.createdAt)}
                                            >
                                                {formatRelativeDate(ret.createdAt)}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Lightbox */}
            {previewUrl && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("closePreview")}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop-in"
                    onClick={() => setPreviewUrl(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        aria-label={t("closePreview")}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                        <FiX className="w-5 h-5" />
                    </button>

                    <div
                        className="relative max-h-[90vh] max-w-[95vw] animate-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={previewUrl}
                            alt="bukti retur"
                            width={1200}
                            height={1200}
                            className="max-h-[90vh] w-auto h-auto rounded-xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
