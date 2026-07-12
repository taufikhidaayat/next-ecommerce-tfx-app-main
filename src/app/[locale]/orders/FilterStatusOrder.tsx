import React from "react";
import clsx from "clsx";
import { OrderStatus } from "@/enum/orderStatus";
import { useTranslations } from "next-intl";

type FilterStatusOrderProps = {
    activeStatus: OrderStatus;
    counts: Partial<Record<OrderStatus, number>>;
    onChange: (status: OrderStatus) => void;
};

// Tab filter status di halaman "Pesanan Saya" (Menunggu/Dikirim/Selesai/Batal),
// masing-masing dengan angka badge jumlahnya (counts).
export default function FilterStatusOrder({
    activeStatus,
    counts,
    onChange,
}: FilterStatusOrderProps) {
    const t = useTranslations("orders.tabs");
    const ORDER_TABS: { key: OrderStatus; label: string }[] = [
        { key: OrderStatus.PENDING, label: t("pending") },
        { key: OrderStatus.PAID, label: t("paid") },
        { key: OrderStatus.PROCESSING, label: t("processing") },
        { key: OrderStatus.SHIPPED, label: t("shipping") },
        { key: OrderStatus.COMPLETED, label: t("completed") },
        { key: OrderStatus.CANCELLED, label: t("canceled") },
    ];

    return (
        <div className="flex w-full gap-2 rounded-2xl border border-green-200 bg-green-50 p-2 shadow-sm my-4 overflow-x-auto no-scrollbar flex-nowrap md:overflow-x-visible md:flex-wrap">
            {ORDER_TABS.map(({ key, label }) => {
                const isActive = activeStatus === key;
                const count = counts[key] ?? 0;

                return (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={clsx(
                            "flex items-center justify-center gap-2 rounded-xl px-4 py-2 transition-all flex-shrink-0 min-w-[100px] md:min-w-0 md:flex-1",
                            isActive
                                ? "bg-green-700 text-white shadow-md"
                                : "text-green-700 hover:bg-green-100"
                        )}
                    >
                        <span className="text-sm font-semibold">{label}</span>
                        {count > 0 && (
                            <span
                                className={clsx(
                                    "inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-xs font-bold",
                                    isActive ? "text-green-700" : "text-green-600"
                                )}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}