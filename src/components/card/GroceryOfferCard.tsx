import { useTranslations } from "next-intl";
import { HiCheckCircle } from "react-icons/hi";
import { RiVipCrownFill } from "react-icons/ri";
import { BsLightningChargeFill } from "react-icons/bs";
import { BiXCircle } from "react-icons/bi";

type GroceryOfferCardProps = {
    minQuantityForDiscount: number;
    discount: number;
    discountPrice: number;
    price: number;
    bulkDiscountPrice: number;
    unit: string;
    isActive?: boolean;
    isDefault?: boolean;
    disabled?: boolean;
    note?: string;
    onClick?: () => void;
};

export default function GroceryOfferCard({
    minQuantityForDiscount,
    discount,
    discountPrice,
    price,
    bulkDiscountPrice,
    unit,
    isActive = false,
    isDefault = false,
    disabled = false,
    note,
    onClick
}: GroceryOfferCardProps) {
    const t = useTranslations("groceryOffer");

    const bulkDiscountPercentage = price > bulkDiscountPrice
        ? Math.floor(((price - bulkDiscountPrice) / price) * 100)
        : 0;

    const savingAmount = price > bulkDiscountPrice
        ? (price - bulkDiscountPrice) * minQuantityForDiscount
        : 0;

    const displayPrice = isDefault
        ? (discount > 0 && discountPrice > 0 ? discountPrice : price)
        : bulkDiscountPrice;

    const hasDiscount = isDefault ? discount > 0 && discountPrice > 0 : price > bulkDiscountPrice;

    if (isDefault) {
        return (
            <div
                onClick={() => { if (!disabled) onClick?.(); }}
                className={`relative rounded-2xl border-2 p-3 transition-all select-none
                    ${disabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                        : isActive
                            ? "cursor-pointer border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10"
                            : "cursor-pointer border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                    }`}
            >
                {/* Radio + Title */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all
                            ${isActive ? "border-emerald-500" : "border-gray-300"}`}>
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{t("regularPrice")}</span>
                    </div>
                    {hasDiscount && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                            <BsLightningChargeFill size={8} />
                            {discount}%
                        </span>
                    )}
                </div>

                <hr className="my-2 border-gray-100" />

                {/* Benefit */}
                <div className="mb-2 flex items-center gap-1.5">
                    {hasDiscount ? (
                        <>
                            <HiCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <p className="text-xs font-medium text-emerald-600">{t("savePercent", { percent: discount })}</p>
                        </>
                    ) : (
                        <>
                            <BiXCircle className="h-3.5 w-3.5 shrink-0 text-orange-400 opacity-60" />
                            <p className="text-xs text-gray-500">{t("regularBenefit.noDiscount")}</p>
                        </>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-end justify-between">
                    <div>
                        {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">
                                Rp {price.toLocaleString("id-ID")}
                            </p>
                        )}
                        <p className={`text-base font-extrabold ${isActive ? "text-emerald-700" : "text-gray-800"}`}>
                            Rp {displayPrice.toLocaleString("id-ID")}
                            <span className="ml-1 text-xs font-normal text-gray-400">/{unit}</span>
                        </p>
                    </div>
                    {isActive && <HiCheckCircle className="h-5 w-5 text-emerald-500" />}
                </div>

                {note && <p className="mt-1.5 text-xs font-medium text-red-500">{note}</p>}
            </div>
        );
    }

    // Bulk / Grosir card
    return (
        <div
            onClick={() => { if (!disabled) onClick?.(); }}
            className={`relative overflow-hidden rounded-2xl border-2 p-3 transition-all select-none
                ${disabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                    : isActive
                        ? "cursor-pointer border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md shadow-orange-400/15"
                        : "cursor-pointer border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm"
                }`}
        >
            {/* "TERBAIK" ribbon pojok kanan atas */}
            {!disabled && (
                <div className="absolute -right-5 top-2.5 rotate-45 bg-orange-500 px-5 py-px text-[9px] font-bold uppercase text-white">
                    {t("bestDeal")}
                </div>
            )}

            {/* Radio + Title */}
            <div className="flex items-center justify-between pr-6">
                <div className="flex items-center gap-2">
                    <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all
                        ${isActive ? "border-orange-500" : "border-gray-300"}`}>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                    </div>
                    <div className="flex items-center gap-1">
                        <RiVipCrownFill className="h-3 w-3 text-orange-400" />
                        <span className="text-sm font-semibold text-gray-700">
                            {t("bulkTitle", { qty: minQuantityForDiscount })}
                        </span>
                    </div>
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                    <BsLightningChargeFill size={8} />
                    {bulkDiscountPercentage}%
                </span>
            </div>

            <hr className="my-2 border-orange-100" />

            {/* Price + Savings */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs text-gray-400 line-through">
                        Rp {price.toLocaleString("id-ID")}
                    </p>
                    <p className={`text-base font-extrabold ${isActive ? "text-orange-600" : "text-gray-800"}`}>
                        Rp {bulkDiscountPrice.toLocaleString("id-ID")}
                        <span className="ml-1 text-xs font-normal text-gray-400">/{unit}</span>
                    </p>
                </div>
                {savingAmount > 0 && (
                    <div className={`rounded-lg px-2 py-1 text-center ${isActive ? "bg-orange-100" : "bg-gray-100"}`}>
                        <p className="text-[9px] font-medium text-gray-500">{t("saveLabel")}</p>
                        <p className={`text-xs font-extrabold ${isActive ? "text-orange-600" : "text-gray-700"}`}>
                            Rp {savingAmount.toLocaleString("id-ID")}
                        </p>
                    </div>
                )}
            </div>

            <div className={`mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors ${isActive ? "bg-orange-100/60" : "bg-gray-50"}`}>
                <HiCheckCircle className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? "text-emerald-500" : "text-gray-300"}`} />
                <p className={`text-xs font-medium transition-colors ${isActive ? "text-orange-700" : "text-gray-400"}`}>{t("bulkBenefit.discount")}</p>
            </div>

            {note && <p className="mt-1.5 text-xs font-medium text-red-500">{note}</p>}
        </div>
    );
}
