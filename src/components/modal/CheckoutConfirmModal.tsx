"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
    FaShoppingBag,
    FaStore,
    FaTruck,
    FaSpinner,
    FaTimes,
    FaCheckCircle,
} from "react-icons/fa";
import { RiBankCardLine, RiQrCodeLine } from "react-icons/ri";
import { formatCurrency } from "@/utils/formatCurrency";
import { PaymentMethod } from "@/enum/paymentMethod";
import { OrderType } from "@/enum/orderType";

type CheckoutConfirmModalProps = {
    open: boolean;
    loading?: boolean;
    itemCount: number;
    finalTotal: number;
    paymentMethod: PaymentMethod;
    orderType: OrderType;
    deliveryAddress?: string;
    productName?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function CheckoutConfirmModal({
    open,
    loading = false,
    itemCount,
    finalTotal,
    paymentMethod,
    orderType,
    deliveryAddress,
    productName,
    onConfirm,
    onCancel,
}: CheckoutConfirmModalProps) {
    const t = useTranslations("checkoutConfirm");
    const [mounted, setMounted] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ startY: number; dragging: boolean } | null>(null);
    const onCancelRef = useRef(onCancel);
    const loadingRef = useRef(loading);
    onCancelRef.current = onCancel;
    loadingRef.current = loading;

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useScrollLock(open);

    // Drag-to-dismiss (mobile only)
    useEffect(() => {
        const el = sheetRef.current;
        if (!el || !open) return;

        let rafId = 0;

        const onStart = (e: TouchEvent) => {
            dragRef.current = { startY: e.touches[0].clientY, dragging: true };
            el.style.transition = "none";
        };

        const onMove = (e: TouchEvent) => {
            if (!dragRef.current?.dragging) return;
            const delta = e.touches[0].clientY - dragRef.current.startY;
            if (delta <= 0) return;
            // Cegah body ikut scroll saat sheet sedang di-drag.
            e.preventDefault();
            const visual = loadingRef.current ? delta * 0.08 : delta;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                el.style.transform = `translateY(${visual}px)`;
            });
        };

        const onEnd = (e: TouchEvent) => {
            if (!dragRef.current?.dragging) return;
            dragRef.current.dragging = false;
            cancelAnimationFrame(rafId);
            const delta = e.changedTouches[0].clientY - dragRef.current.startY;
            el.style.transition = "transform 0.3s cubic-bezier(0.32,0.72,0,1)";
            if (!loadingRef.current && delta > 100) {
                el.style.transform = `translateY(100%)`;
                setTimeout(() => onCancelRef.current(), 280);
            } else {
                el.style.transform = "translateY(0)";
            }
        };

        el.addEventListener("touchstart", onStart, { passive: true });
        // passive:false wajib agar e.preventDefault() bisa dipanggil di onMove.
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            cancelAnimationFrame(rafId);
            el.removeEventListener("touchstart", onStart);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onEnd);
        };
    }, [open]);

    if (!mounted || !open) return null;

    const paymentLabel =
        paymentMethod === PaymentMethod.QRIS ? "QRIS" : t("bankTransfer");
    const orderTypeLabel =
        orderType === OrderType.PICKUP ? t("pickup") : t("delivery");

    return createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={loading ? undefined : onCancel}
        >
            <div
                ref={sheetRef}
                className="w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hero area */}
                <div className="relative bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center pt-6 pb-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        aria-label="Tutup"
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-500 text-red-500 hover:text-white transition disabled:opacity-50"
                    >
                        <FaTimes size={13} />
                    </button>
                    {/* Drag pill — visible only on mobile */}
                    <div className="w-10 h-1 rounded-full bg-gray-300 mb-4 sm:hidden" />
                    <Image
                        src="/images/verify_checkout.png"
                        alt="Konfirmasi Checkout"
                        width={200}
                        height={160}
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Body */}
                <div className="px-5 pb-6 pt-3">
                    {/* Title */}
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {t("title")}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Summary card */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-5 border border-gray-100">
                        {/* Items */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaShoppingBag className="text-emerald-600 text-sm" />
                            </div>
                            <span className="text-sm text-gray-500 flex-1">
                                {t("items")}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 text-right max-w-[55%] leading-tight">
                                {productName
                                    ? productName
                                    : t("itemCount", { count: itemCount })}
                            </span>
                        </div>

                        {/* Payment method */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {paymentMethod === PaymentMethod.QRIS ? (
                                    <RiQrCodeLine className="text-blue-600 text-base" />
                                ) : (
                                    <RiBankCardLine className="text-blue-600 text-base" />
                                )}
                            </div>
                            <span className="text-sm text-gray-500 flex-1">
                                {t("paymentMethod")}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {paymentLabel}
                            </span>
                        </div>

                        {/* Order type */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {orderType === OrderType.PICKUP ? (
                                    <FaStore className="text-purple-600 text-sm" />
                                ) : (
                                    <FaTruck className="text-purple-600 text-sm" />
                                )}
                            </div>
                            <span className="text-sm text-gray-500 flex-1">
                                {t("orderType")}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {orderTypeLabel}
                            </span>
                        </div>

                        {/* Delivery address */}
                        {orderType === OrderType.DELIVERY && deliveryAddress && (
                            <div className="ml-11 text-xs text-gray-400 leading-relaxed bg-white border border-gray-200 rounded-xl px-3 py-2">
                                {deliveryAddress}
                            </div>
                        )}

                        {/* Divider + Total */}
                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                                {t("total")}
                            </span>
                            <span className="text-xl font-extrabold text-emerald-600">
                                {formatCurrency(finalTotal)}
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaCheckCircle />
                            )}
                            {loading ? t("processing") : t("confirm")}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
