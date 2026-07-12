"use client";

import { PaymentMethod } from "@/enum/paymentMethod";
import { OrderType } from "@/enum/orderType";
import { StoreSettings } from "@/types/storeSettings";
import { UserAddress } from "@/types/user/userAddress";
import { DeliveryData } from "./OrderTypeSelector";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculateEuclideanDistance } from "@/utils/distance";
import { FiCreditCard } from "react-icons/fi";
import { RiQrCodeLine, RiBankCardLine } from "react-icons/ri";
import { useTranslations } from "next-intl";
import OrderTypeSelector from "./OrderTypeSelector";
import PointsRedeemInput from "./PointsRedeemInput";

type FirstPurchaseDiscount = {
    eligible: boolean;
    discountPercent: number;
} | null;

type CartPaymentInfoProps = {
    initialTotalPrice: number;
    actualTotalPrice: number;
    isPending?: boolean;
    onCheckout?: () => void;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    note: string;
    setNote: (note: string) => void;
    isDisable?: boolean;
    orderType: OrderType;
    onOrderTypeChange: (type: OrderType) => void;
    deliveryData: DeliveryData;
    onDeliveryDataChange: (data: DeliveryData) => void;
    storeSettings: StoreSettings | null;
    savedAddresses?: UserAddress[];
    isLoadingAddresses?: boolean;
    firstPurchaseDiscount?: FirstPurchaseDiscount;
    onNavigateAway?: () => void;
    pointsToRedeem: number;
    onPointsRedeemChange: (points: number) => void;
};

interface CheckoutButtonProps {
    onClick?: () => void;
    isPending?: boolean;
}

// Rincian pembayaran di keranjang/checkout: subtotal, diskon, ongkir, potongan poin,
// dan total akhir yang harus dibayar.
export default function CartPaymentInfo({
    initialTotalPrice,
    actualTotalPrice,
    onCheckout,
    isPending,
    paymentMethod,
    setPaymentMethod,
    note,
    setNote,
    isDisable,
    orderType,
    onOrderTypeChange,
    deliveryData,
    onDeliveryDataChange,
    storeSettings,
    savedAddresses,
    isLoadingAddresses,
    firstPurchaseDiscount,
    onNavigateAway,
    pointsToRedeem,
    onPointsRedeemChange,
}: CartPaymentInfoProps) {
    const t = useTranslations("cartPayment");
    const isFirstPurchaseEligibleFlag = firstPurchaseDiscount?.eligible && firstPurchaseDiscount.discountPercent > 0;
    const firstPurchaseDiscountAmount = isFirstPurchaseEligibleFlag
        ? Math.round(Number(actualTotalPrice) * (firstPurchaseDiscount!.discountPercent / 100))
        : 0;
    const totalForPointsCap = Number(actualTotalPrice) - firstPurchaseDiscountAmount;

    // Check delivery eligibility
    let isDeliveryEligible = true;
    if (orderType === OrderType.DELIVERY && storeSettings) {
        const hasLocation = deliveryData.latitude != null && deliveryData.longitude != null;
        const hasRequiredFields = deliveryData.address.trim() !== "" && deliveryData.phone.trim() !== "";

        if (hasLocation) {
            const distance = calculateEuclideanDistance(
                storeSettings.storeLatitude,
                storeSettings.storeLongitude,
                deliveryData.latitude!,
                deliveryData.longitude!
            );
            const withinRadius = distance <= storeSettings.maxDeliveryRadius;
            const meetsMinPurchase = actualTotalPrice >= storeSettings.minPurchaseDelivery;
            isDeliveryEligible = withinRadius && meetsMinPurchase && hasRequiredFields;
        } else {
            isDeliveryEligible = false;
        }
    }

    const checkoutDisabled = isDisable || isPending || (orderType === OrderType.DELIVERY && !isDeliveryEligible);

    return (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:overflow-y-auto sm:overscroll-y-contain overflow-hidden">
            {/* Header strip */}
            <div className="flex items-center gap-2.5 bg-white px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FiCreditCard className="text-emerald-600 text-sm sm:text-base" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-emerald-700 tracking-wide">{t("title")}</h3>
            </div>

            <div className="p-3 sm:p-5 space-y-4 sm:space-y-5 text-xs sm:text-sm">
                <OrderTypeSelector
                    orderType={orderType}
                    onOrderTypeChange={onOrderTypeChange}
                    deliveryData={deliveryData}
                    onDeliveryDataChange={onDeliveryDataChange}
                    storeSettings={storeSettings}
                    totalPrice={actualTotalPrice}
                    isDisable={isDisable}
                    savedAddresses={savedAddresses}
                    isLoadingAddresses={isLoadingAddresses}
                    onNavigateAway={onNavigateAway}
                />
                <PaymentMethodSelector
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    isDisable={isDisable}
                />
                <NoteInput
                    value={note}
                    onChange={setNote}
                    isDisable={isDisable}
                />
                <PointsRedeemInput
                    totalPrice={totalForPointsCap}
                    pointsToRedeem={pointsToRedeem}
                    onChange={onPointsRedeemChange}
                    isDisable={isDisable}
                />
                <TotalPriceDisplay
                    initialTotalPrice={initialTotalPrice}
                    actualTotalPrice={actualTotalPrice}
                    firstPurchaseDiscount={firstPurchaseDiscount}
                    pointsRedeemed={pointsToRedeem}
                />
            </div>
            <div className="px-3 pb-3 sm:px-5 sm:pb-5">
                <CheckoutButton
                    onClick={onCheckout}
                    isPending={isPending}
                    isDisable={checkoutDisabled}
                />
            </div>
        </div>
    );
}

function PaymentMethodSelector({
    selected,
    onChange,
    isDisable
}: {
    selected: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
    isDisable?: boolean;
}) {
    const t = useTranslations("cartPayment");
    const disableClass = "opacity-50 cursor-not-allowed pointer-events-none";

    return (
        <div>
            <label className="font-semibold text-gray-700 mb-2 block">{t("methodLabel")}</label>
            <div className="flex gap-2 sm:gap-3 items-stretch min-w-0 overflow-x-hidden">
                {/* Bank Transfer */}
                <button
                    onClick={() => !isDisable && onChange(PaymentMethod.BANK_TRANSFER)}
                    className={`flex items-center justify-center gap-2 flex-1 min-w-0 border px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-medium transition shadow-sm h-full text-xs sm:text-base ${selected === PaymentMethod.BANK_TRANSFER
                        ? "bg-white text-blue-600 border-blue-400 shadow-sm"
                        : "bg-white text-gray-400 hover:text-gray-600 border-gray-200"
                        } ${isDisable ? disableClass : ""}`}
                    aria-label={t("bank")}
                >
                    <RiBankCardLine size={16} /> {t("bank")}
                </button>

                {/* QRIS */}
                <button
                    onClick={() => !isDisable && onChange(PaymentMethod.QRIS)}
                    className={`flex items-center justify-center gap-2 flex-1 min-w-0 border px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-medium transition shadow-sm h-full text-xs sm:text-base ${selected === PaymentMethod.QRIS
                        ? "bg-white text-blue-600 border-blue-400 shadow-sm"
                        : "bg-white text-gray-400 hover:text-gray-600 border-gray-200"
                        } ${isDisable ? disableClass : ""}`}
                    aria-label={t("qris")}
                >
                    <RiQrCodeLine size={16} /> {t("qris")}
                </button>
            </div>
        </div>
    );
}

function NoteInput({
    value,
    onChange,
    isDisable
}: {
    value: string;
    onChange: (val: string) => void;
    isDisable?: boolean;
}) {
    const t = useTranslations("cartPayment");
    return (
        <div>
            <label className="font-semibold text-gray-700 mb-2 block">{t("noteLabel")}</label>
            <textarea
                placeholder={t("notePlaceholder")}
                value={value}
                onChange={(e) => !isDisable && onChange(e.target.value)}
                disabled={isDisable}
                className={`w-full p-2 sm:p-4 border rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-500 shadow-sm resize-none transition ${isDisable
                    ? "bg-gray-100 opacity-50 cursor-not-allowed"
                    : "bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    }`}
                rows={2}
                aria-label={t("noteLabel")}
            />
        </div>
    );
}

function TotalPriceDisplay({
    initialTotalPrice,
    actualTotalPrice,
    firstPurchaseDiscount,
    pointsRedeemed = 0,
}: {
    initialTotalPrice: number;
    actualTotalPrice: number;
    firstPurchaseDiscount?: FirstPurchaseDiscount;
    pointsRedeemed?: number;
}) {
    const t = useTranslations("cartPayment");
    const productDiscount = Math.max(0, Number(initialTotalPrice) - Number(actualTotalPrice));
    const isFirstPurchaseEligible = firstPurchaseDiscount?.eligible && firstPurchaseDiscount.discountPercent > 0;
    const firstPurchaseDiscountAmount = isFirstPurchaseEligible
        ? Math.round(Number(actualTotalPrice) * (firstPurchaseDiscount.discountPercent / 100))
        : 0;
    const finalTotal = Math.max(0, Number(actualTotalPrice) - firstPurchaseDiscountAmount - pointsRedeemed);

    return (
        <div className="p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl w-full">
            {/* Original Price */}
            <div className="flex justify-between text-gray-600 mb-2 text-xs sm:text-sm">
                <span>{t("originalPrice")}</span>
                <span className="font-medium">
                    {formatCurrency(Number(initialTotalPrice))}
                </span>
            </div>

            {/* Product Discount */}
            {productDiscount > 0 && (
                <div className="flex justify-between text-red-500 mb-2 sm:mb-3 text-xs sm:text-sm">
                    <span>{t("discount")}</span>
                    <span className="font-medium">
                        -{formatCurrency(productDiscount)}
                    </span>
                </div>
            )}

            {/* First Purchase Discount - highlighted */}
            {isFirstPurchaseEligible && (
                <div className="flex justify-between items-center mb-2 sm:mb-3 text-xs sm:text-sm bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                        {t("firstPurchaseDiscount", { percent: firstPurchaseDiscount.discountPercent })}
                    </span>
                    <span className="font-bold text-amber-600">
                        -{formatCurrency(firstPurchaseDiscountAmount)}
                    </span>
                </div>
            )}

            {/* Points Redeemed */}
            {pointsRedeemed > 0 && (
                <div className="flex justify-between items-center mb-2 sm:mb-3 text-xs sm:text-sm bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                    <span className="font-semibold text-amber-700">
                        {t("pointsRedeemed", { count: pointsRedeemed.toLocaleString("id-ID") })}
                    </span>
                    <span className="font-bold text-amber-600">
                        -{formatCurrency(pointsRedeemed)}
                    </span>
                </div>
            )}

            {/* Delivery Fee */}
            <div className="flex justify-between text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm">
                <span>{t("deliveryFee") || "Ongkir"}</span>
                <span className="font-medium text-emerald-600">
                    {t("free") || "Gratis"}
                </span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-200">
                <span className="text-sm sm:text-base font-bold text-gray-700">{t("total")}</span>
                <div className="text-right">
                    {isFirstPurchaseEligible && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                            {formatCurrency(Number(actualTotalPrice))}
                        </span>
                    )}
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                        {formatCurrency(finalTotal)}
                    </span>
                </div>
            </div>

            {/* Savings summary */}
            {isFirstPurchaseEligible && (
                <div className="mt-2 text-center">
                    <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                        {t("youSave")} {formatCurrency(firstPurchaseDiscountAmount + productDiscount)}
                    </span>
                </div>
            )}
        </div>
    );
}

function CheckoutButton({
    onClick = () => { },
    isPending,
    isDisable
}: CheckoutButtonProps & { isDisable?: boolean }) {
    const t = useTranslations("cartPayment");
    const disabled = isPending || isDisable;
    return (
        <button
            onClick={() => !disabled && onClick()}
            disabled={disabled}
            className={`w-full py-3 sm:py-3.5 rounded-2xl transition-all font-bold text-sm sm:text-base tracking-wide ${disabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-200 active:scale-[0.98]"
                }`}
        >
            {isPending ? t("processing") : t("checkout")}
        </button>
    );
}
