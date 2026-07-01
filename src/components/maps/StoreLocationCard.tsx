"use client";

import { useTranslations } from "next-intl";
import { FiMapPin } from "react-icons/fi";
import { MdOutlineMyLocation } from "react-icons/md";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useStoreSettings } from "@/satelite/services/storeSettingsService";

export default function StoreLocationCard() {
    const t = useTranslations("home.storeLocation");
    const { data, isPending } = useStoreSettings();

    const store = data?.data;
    const lat = store?.storeLatitude;
    const lng = store?.storeLongitude;
    const hasCoords =
        typeof lat === "number" &&
        typeof lng === "number" &&
        !(lat === 0 && lng === 0);

    // Google Maps directions link derived straight from store settings — it updates
    // automatically whenever the admin changes the coordinate in Store Settings.
    // Opening it lands the user directly on the route to the store.
    const directionsUrl = hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : "#";

    return (
        <div className="animate-border-gradient mt-4 w-full rounded-2xl bg-[linear-gradient(90deg,#047857,#34d399,#fde047,#22c55e,#facc15,#10b981,#6ee7b7,#047857)] p-[2px] shadow-lg">
        <div className="rounded-[15px] bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
                <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FiMapPin className="text-green-700" size={18} />
                </span>
                <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-green-800 leading-tight">
                        {isPending ? <Skeleton width={120} /> : store?.storeName || t("title")}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            {/* Address + actions */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-3">
                {isPending ? (
                    <Skeleton count={2} />
                ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {store?.storeAddress || t("addressFallback")}
                    </p>
                )}

                {hasCoords && (
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-transparent px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(90deg,#4285f4,#ea4335,#fbbc05,#34a853)_border-box] hover:text-white hover:[background:linear-gradient(#2563eb,#2563eb)_padding-box,linear-gradient(90deg,#4285f4,#ea4335,#fbbc05,#34a853)_border-box]"
                    >
                        <MdOutlineMyLocation size={17} className="transition-transform group-hover:rotate-12" />
                        {t("openInMaps")}
                    </a>
                )}
            </div>
        </div>
        </div>
    );
}
