"use client";
import React from "react";
import {
    FaCheckCircle,
    FaClipboardCheck,
    FaClock,
    FaShippingFast,
    FaStore,
    FaTimesCircle,
    FaTruck,
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { OrderType } from "@/enum/orderType";

interface OrderFlowProps {
    currentStep: number;
    isCancelled?: boolean;
    orderType?: string;
}

// Penanda progres pesanan (stepper) di halaman detail order pelanggan: deretan tahap
// dengan tahap aktif/lewat diberi warna. `step` (dari util currentStep) menentukan posisinya.
export default function OrderFlow({
    currentStep,
    isCancelled = false,
    orderType,
}: OrderFlowProps) {
    const t = useTranslations("orderFlow");

    const getSteps = () => {
        const baseSteps = [
            { label: t("waitingPayment"), icon: <FaClock /> },
            { label: t("verifyingPayment"), icon: <FaClipboardCheck /> },
            { label: t("preparingOrder"), icon: <FaShippingFast /> },
        ];

        if (orderType === OrderType.DELIVERY) {
            baseSteps.push({ label: t("onDelivery"), icon: <FaTruck /> });
            if (isCancelled) {
                baseSteps.push({ label: t("cancelled"), icon: <FaTimesCircle /> });
            } else {
                // "Telah Diantar" lalu "Selesai", keduanya otomatis hijau begitu pesanan diantar
                // (tidak ada langkah manual tambahan).
                baseSteps.push({ label: t("delivered"), icon: <FaCheckCircle /> });
                baseSteps.push({ label: t("completed"), icon: <FaCheckCircle /> });
            }
        } else if (orderType === OrderType.PICKUP) {
            baseSteps.push({ label: t("readyForPickup"), icon: <FaStore /> });
            baseSteps.push({
                label: isCancelled ? t("cancelled") : t("completed"),
                icon: isCancelled ? <FaTimesCircle /> : <FaCheckCircle />,
            });
        } else {
            baseSteps.push({
                label: isCancelled ? t("cancelled") : t("completed"),
                icon: isCancelled ? <FaTimesCircle /> : <FaCheckCircle />,
            });
        }

        return baseSteps;
    };

    const steps = getSteps();

    return (
        <div className="flex items-start w-full max-w-4xl sm:max-w-5xl mx-auto px-2 sm:px-6 pt-6 pb-2 sm:pt-8 sm:pb-3 overflow-x-auto no-scrollbar gap-2 sm:gap-0">
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const isCurrent = index === currentStep;
                const isPassed = index < currentStep;
                // Connector yang meninggalkan step aktif = sedang "berproses" ke step berikutnya.
                const isActiveConnector = !isCancelled && index === currentStep;

                let circleStyle = "bg-gray-100 border-gray-300 text-gray-500";
                let textStyle = "text-gray-400";

                if (isCancelled && isLast) {
                    circleStyle = "bg-red-100 border-red-600 text-red-600";
                    textStyle = "text-red-600";
                } else if (isCancelled && index === 0) {
                    // Highlight the first step where cancellation originated
                    circleStyle = "bg-red-50 border-red-400 text-red-500";
                    textStyle = "text-red-500";
                } else if (!isCancelled) {
                    if (isPassed) {
                        circleStyle = "bg-emerald-200 border-emerald-400 text-emerald-800";
                        textStyle = "text-black";
                    } else if (isCurrent) {
                        circleStyle = "bg-emerald-500 border-emerald-500 text-white";
                        textStyle = "text-black";
                    }
                }

                // Warna bar penghubung (statis): hijau penuh kalau sudah lewat, abu kalau
                // belum, merah pada bar terakhir saat dibatalkan. Bar aktif dirender terpisah.
                const barStyle = isCancelled
                    ? index === steps.length - 2
                        ? "bg-red-300"
                        : "bg-gray-200"
                    : isPassed
                        ? "bg-emerald-500"
                        : "bg-gray-200";

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center min-w-[72px]">
                            <div className="relative inline-flex">
                                {isCurrent && !isCancelled && (
                                    <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                                )}
                                <div
                                    className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300
                                        w-8 h-8 sm:w-10 sm:h-10
                                        text-base sm:text-lg
                                        ${circleStyle}`}
                                >
                                    {step.icon}
                                </div>
                            </div>
                            <p
                                className={`mt-2 text-xs sm:text-sm font-medium transition-all duration-300 ${textStyle} text-center`}
                            >
                                {step.label}
                            </p>
                        </div>
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex items-center h-8 sm:h-10 sm:flex-1 sm:px-2">
                                {isActiveConnector ? (
                                    // Bar terisi dari kiri ke kanan (mengulang), kesan "sedang berproses".
                                    <div className="relative h-1 w-8 sm:w-full overflow-hidden rounded-full bg-emerald-100">
                                        <div className="absolute inset-0 origin-left rounded-full bg-emerald-500 animate-progress-fill" />
                                    </div>
                                ) : (
                                    // Bar statis: hijau penuh (sudah lewat) / abu (belum) / merah (dibatalkan).
                                    <div className={`h-1 w-8 sm:w-full rounded-full ${barStyle}`}></div>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
