"use client";

import { OrderType } from "@/enum/orderType";
import { StoreSettings } from "@/types/storeSettings";
import { UserAddress } from "@/types/user/userAddress";
import { FaStore, FaTruck } from "react-icons/fa";
import { FiMapPin, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { calculateEuclideanDistance } from "@/utils/distance";
import { formatCurrency } from "@/utils/formatCurrency";

export interface DeliveryData {
    address: string;
    phone: string;
    notes: string;
    latitude: number | null;
    longitude: number | null;
}

interface OrderTypeSelectorProps {
    orderType: OrderType;
    onOrderTypeChange: (type: OrderType) => void;
    deliveryData: DeliveryData;
    onDeliveryDataChange: (data: DeliveryData) => void;
    storeSettings: StoreSettings | null;
    totalPrice: number;
    isDisable?: boolean;
    savedAddresses?: UserAddress[];
    isLoadingAddresses?: boolean;
    onNavigateAway?: () => void;
}

export default function OrderTypeSelector({
    orderType,
    onOrderTypeChange,
    deliveryData,
    onDeliveryDataChange,
    storeSettings,
    totalPrice,
    isDisable,
    savedAddresses = [],
    isLoadingAddresses = false,
    onNavigateAway,
}: OrderTypeSelectorProps) {
    const t = useTranslations("delivery");
    const disableClass = "opacity-50 cursor-not-allowed pointer-events-none";

    const handleSelectAddress = (addressId: string) => {
        const selected = savedAddresses.find((a) => a.id === addressId);
        if (selected) {
            onDeliveryDataChange({
                ...deliveryData,
                phone: selected.phone,
                address: selected.address,
                latitude: selected.latitude,
                longitude: selected.longitude,
            });
        }
    };

    // Calculate distance for selected address
    const distance =
        deliveryData.latitude != null && deliveryData.longitude != null && storeSettings
            ? calculateEuclideanDistance(
                storeSettings.storeLatitude,
                storeSettings.storeLongitude,
                deliveryData.latitude,
                deliveryData.longitude
            )
            : null;

    const withinRadius = distance !== null && storeSettings ? distance <= storeSettings.maxDeliveryRadius : false;
    const meetsMinPurchase = storeSettings ? totalPrice >= storeSettings.minPurchaseDelivery : true;

    // Only offer saved addresses that fall within the store's delivery range.
    // When store settings are unavailable we can't filter, so show them all.
    const isAddressWithinRadius = (addr: UserAddress) => {
        if (!storeSettings) return true;
        const d = calculateEuclideanDistance(
            storeSettings.storeLatitude,
            storeSettings.storeLongitude,
            addr.latitude,
            addr.longitude
        );
        return d <= storeSettings.maxDeliveryRadius;
    };
    const eligibleAddresses = savedAddresses.filter(isAddressWithinRadius);

    return (
        <div className="space-y-3">
            <label className="font-semibold text-gray-700 block text-xs sm:text-sm">
                {t("orderType")}
            </label>

            {/* Toggle: the whole control is one switch — clicking anywhere flips it. */}
            <button
                type="button"
                role="switch"
                aria-checked={orderType === OrderType.DELIVERY}
                onClick={() =>
                    !isDisable &&
                    onOrderTypeChange(
                        orderType === OrderType.PICKUP ? OrderType.DELIVERY : OrderType.PICKUP
                    )
                }
                className={`relative flex w-full rounded-xl border border-gray-200 bg-white p-1 ${isDisable ? disableClass : ""}`}
            >
                {/* Sliding pill — filled blue when active */}
                <span
                    className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-blue-600 shadow-sm transition-transform duration-300 ease-out ${
                        orderType === OrderType.DELIVERY ? "translate-x-full" : "translate-x-0"
                    }`}
                />
                <span
                    className={`relative z-10 flex items-center justify-center gap-2 flex-1 px-3 py-2.5 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                        orderType === OrderType.PICKUP ? "text-white" : "text-gray-400"
                    }`}
                >
                    <FaStore size={14} />
                    {t("pickup")}
                </span>

                <span
                    className={`relative z-10 flex items-center justify-center gap-2 flex-1 px-3 py-2.5 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                        orderType === OrderType.DELIVERY ? "text-white" : "text-gray-400"
                    }`}
                >
                    <FaTruck size={14} />
                    {t("delivery")}
                </span>
            </button>

            {/* Delivery form */}
            {orderType === OrderType.DELIVERY && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                    {/* Saved Address Selector */}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 block">
                            {t("selectEligibleAddress")}
                        </label>

                        {isLoadingAddresses ? (
                            <div className="space-y-2">
                                <div className="animate-pulse bg-gray-100 rounded-xl h-16" />
                                <div className="animate-pulse bg-gray-100 rounded-xl h-16" />
                            </div>
                        ) : eligibleAddresses.length > 0 ? (
                            <div className="space-y-2">
                                {eligibleAddresses.map((addr) => {
                                    const isSelected =
                                        deliveryData.latitude === addr.latitude &&
                                        deliveryData.longitude === addr.longitude &&
                                        deliveryData.address === addr.address;

                                    // Calculate distance for each address
                                    const addrDistance = storeSettings
                                        ? calculateEuclideanDistance(
                                            storeSettings.storeLatitude,
                                            storeSettings.storeLongitude,
                                            addr.latitude,
                                            addr.longitude
                                        )
                                        : null;
                                    const addrWithinRadius = addrDistance !== null && storeSettings
                                        ? addrDistance <= storeSettings.maxDeliveryRadius
                                        : true;

                                    return (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() => !isDisable && handleSelectAddress(addr.id)}
                                            disabled={isDisable}
                                            className={`w-full text-left p-2.5 sm:p-3 border rounded-xl transition text-xs sm:text-sm ${
                                                isSelected
                                                    ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400"
                                                    : addrWithinRadius
                                                        ? "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                                        : "border-red-200 bg-red-50/50 hover:border-red-300"
                                            } ${isDisable ? disableClass : ""}`}
                                        >
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <FiMapPin size={13} className={isSelected ? "text-emerald-600" : addrWithinRadius ? "text-gray-400" : "text-red-400"} />
                                                <span className="font-semibold text-gray-800">{addr.label}</span>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                                                        Default
                                                    </span>
                                                )}
                                                {/* Distance badge */}
                                                {addrDistance !== null && (
                                                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                                        addrWithinRadius
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-red-100 text-red-600"
                                                    }`}>
                                                        {addrDistance} km
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 line-clamp-1 pl-5">{addr.address}</p>
                                            <p className="text-gray-400 text-[11px] pl-5">{addr.recipientName} - {addr.phone}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : savedAddresses.length > 0 ? (
                            // Has saved addresses, but none are within delivery range.
                            <div className="flex flex-col items-center gap-2 py-4 px-3 border border-dashed border-red-300 rounded-xl bg-red-50/50">
                                <Image
                                    src="/images/location_unavailable.png"
                                    alt={t("noEligibleAddressTitle")}
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                />
                                <p className="text-xs sm:text-sm text-red-700 font-semibold text-center">
                                    {t("noEligibleAddressTitle")}
                                </p>
                                <p className="text-[11px] sm:text-xs text-red-600 text-center">
                                    {t("noEligibleAddressDesc", { radius: storeSettings?.maxDeliveryRadius ?? 0 })}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-4 px-3 border border-dashed border-amber-300 rounded-xl bg-amber-50/50">
                                <FiAlertCircle className="text-amber-500" size={20} />
                                <p className="text-xs sm:text-sm text-amber-700 font-medium text-center">
                                    {t("noSavedAddress")}
                                    <br />
                                    {t("setupAddressFirst")}
                                </p>
                                <Link
                                    href="/profile"
                                    onClick={onNavigateAway}
                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                                >
                                    {t("goToProfile")}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Delivery eligibility status */}
                    {deliveryData.latitude != null && deliveryData.longitude != null && storeSettings && (
                        <div className="space-y-1.5">
                            {/* Distance indicator */}
                            <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm ${
                                withinRadius ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                            }`}>
                                <span className="flex items-center gap-1.5">
                                    {withinRadius ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                                    {t("distanceToStore")}
                                </span>
                                <span className="font-semibold">{distance} km</span>
                            </div>

                            {!withinRadius && (
                                <p className="text-xs text-red-500 px-1">
                                    {t("tooFar", { radius: storeSettings.maxDeliveryRadius })}
                                </p>
                            )}

                            {!meetsMinPurchase && (
                                <div className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs sm:text-sm">
                                    <p>{t("minPurchaseNotMet", { amount: formatCurrency(storeSettings.minPurchaseDelivery) })}</p>
                                    <p className="font-semibold mt-0.5">
                                        {t("remaining", { amount: formatCurrency(storeSettings.minPurchaseDelivery - totalPrice) })}
                                    </p>
                                </div>
                            )}

                            {withinRadius && meetsMinPurchase && (
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium">
                                    <FiCheckCircle size={14} />
                                    {t("eligible")}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
