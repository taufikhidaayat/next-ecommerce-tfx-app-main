import { OrderStatus } from "@/enum/orderStatus";
import { HistoryOrder } from "@/types/order/historyOrder";
import { formatDateAndTimeForUser } from "@/utils/formatDateAndTimeForUser";
import { FiClock } from "react-icons/fi";
import { useTranslations, useLocale } from "next-intl";

type Props = {
    title: string;
    active?: boolean;
    isLast?: boolean;
    item: HistoryOrder;
};

// Satu titik pada garis waktu (timeline) status pesanan: judul tahap + penanda aktif/lewat.
export default function OrderTimelineItem({ title, active, isLast, item }: Props) {
    const t = useTranslations("orders.timeline");
    const locale = useLocale();

    return (
        <div className="relative flex items-start gap-3 md:gap-6">
            {/* LEFT SIDE ICON + LINE */}
            <div className="relative flex flex-col items-center min-w-[32px]">
                {/* CLOCK ICON */}
                <FiClock
                    className={`w-5 h-5 mt-1 ${item.status === OrderStatus.CANCELLED
                        ? 'text-red-600'
                        : active
                            ? 'text-green-600'
                            : 'text-gray-300'
                        }`}
                />

                {/* LINE */}
                {!isLast && (
                    <div
                        className={`absolute top-8 left-1/2 -translate-x-1/2 w-px h-[calc(100%+10px)] ${item.status === OrderStatus.CANCELLED ? 'bg-red-300' : 'bg-gray-300'
                            }`}
                    />
                )}
            </div>

            {/* CONTENT */}
            <div className="pb-4 md:pb-6 flex-1">
                <h3
                    className={`font-semibold text-xs md:text-base ${item.status === OrderStatus.CANCELLED
                        ? 'text-red-700'
                        : active
                            ? 'text-green-700'
                            : 'text-gray-500'
                        }`}
                >
                    {title}
                </h3>
                {item.notes && (
                    <p className={`text-xs mt-0.5 ${item.status === OrderStatus.CANCELLED ? 'text-red-500 font-medium' : 'text-gray-400 italic'}`}>
                        {item.notes}
                    </p>
                )}
                <p className="text-xs md:text-sm text-gray-500">{formatDateAndTimeForUser(item.changedAt, locale)}</p>

                {/* UPDATED BY - Mobile only */}
                <div className="block md:hidden mt-1">
                    <p className="text-xs text-gray-400 italic">
                        {t("updatedBy", { name: item.createdBy })}
                    </p>
                </div>
            </div>

            <div className="hidden md:block absolute top-0 right-0 pr-2">
                <p className="text-sm text-gray-400 italic">
                    {t("updatedBy", { name: item.createdBy })}
                </p>
            </div>
        </div>
    );
}
