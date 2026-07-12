"use client";

import { useEffect, useState } from "react";
import { FaCoins } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { usePointBalance } from "@/satelite/services/pointService";

type Props = {
    totalPrice: number;
    pointsToRedeem: number;
    onChange: (points: number) => void;
    isDisable?: boolean;
};

// Input pakai poin saat checkout: user memilih berapa poin dipakai untuk potongan.
// Dibatasi maksimal 50% dari total dan tidak melebihi saldo poin (sesuai aturan backend).
export default function PointsRedeemInput({
    totalPrice,
    pointsToRedeem,
    onChange,
    isDisable,
}: Props) {
    const t = useTranslations("cartPayment.points");
    const { data, isPending } = usePointBalance();
    const balance = data?.data?.points ?? 0;
    const maxByCap = Math.floor(Number(totalPrice) * 0.5);
    const maxRedeemable = Math.max(0, Math.min(balance, maxByCap));

    const [isExpanded, setIsExpanded] = useState<boolean>(pointsToRedeem > 0);

    useEffect(() => {
        if (pointsToRedeem > maxRedeemable) {
            onChange(maxRedeemable);
        }
    }, [maxRedeemable, pointsToRedeem, onChange]);

    useEffect(() => {
        if (pointsToRedeem === 0 && !isExpanded) return;
        if (pointsToRedeem > 0 && !isExpanded) setIsExpanded(true);
    }, [pointsToRedeem, isExpanded]);

    if (isPending) return null;
    if (balance <= 0) return null;

    const handleToggle = () => {
        if (isDisable) return;
        if (isExpanded) {
            setIsExpanded(false);
            onChange(0);
        } else {
            setIsExpanded(true);
            onChange(maxRedeemable);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = Number(e.target.value.replace(/[^0-9]/g, ""));
        const clamped = Math.max(0, Math.min(raw, maxRedeemable));
        onChange(clamped);
    };

    return (
        <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <FaCoins className="text-amber-500 text-base sm:text-lg" />
                    <div>
                        <div className="font-semibold text-gray-800 text-xs sm:text-sm">
                            {t("title")}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500">
                            {t("balance", { count: balance.toLocaleString("id-ID") })}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isDisable || maxRedeemable === 0}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition shrink-0 ${
                        isExpanded ? "bg-amber-500" : "bg-gray-300"
                    } ${isDisable || maxRedeemable === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            isExpanded ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                </button>
            </div>

            {isExpanded && (
                <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={pointsToRedeem.toLocaleString("id-ID")}
                            onChange={handleInputChange}
                            disabled={isDisable}
                            className="flex-1 px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => onChange(maxRedeemable)}
                            disabled={isDisable}
                            className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                        >
                            {t("useMax")}
                        </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                        {t("hint", { max: maxRedeemable.toLocaleString("id-ID") })}
                    </p>
                    {pointsToRedeem === 0 && (
                        <p className="flex items-start gap-1 text-[10px] sm:text-xs text-amber-700 bg-amber-100/60 border border-amber-200 rounded-md px-2 py-1.5">
                            <span aria-hidden>⚠️</span>
                            <span>{t("zeroWarning")}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
