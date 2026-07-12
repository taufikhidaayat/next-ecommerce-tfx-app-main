"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiInfo, FiClock } from "react-icons/fi";
import { OrderStatus } from "@/enum/orderStatus";

type Props = {
    orderStatus: string;
};

// Info retur untuk pelanggan: hanya muncul setelah barang diterima
// (Telah Diantar / Pesanan Selesai), berlaku untuk pickup & delivery.
// Retur dilakukan langsung di toko, komponen ini hanya menginformasikan.
// Pemberitahuan info retur di halaman detail order (mis. syarat/cara mengajukan retur),
// muncul saat status pesanan memungkinkan retur.
export default function ReturnInfoNotice({ orderStatus }: Props) {
    const t = useTranslations("orderDetail.returnInfo");

    const eligible =
        orderStatus === OrderStatus.DELIVERED ||
        orderStatus === OrderStatus.COMPLETED;

    if (!eligible) return null;

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-orange-50/60 to-white p-5 shadow-sm sm:p-6">
            {/* dekorasi lingkaran lembut di latar */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-200/30 blur-2xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-orange-200/20 blur-2xl" />

            <div className="relative flex items-center gap-4 sm:gap-6">
                <div className="shrink-0">
                    <Image
                        src="/images/returndetailpesanannotifalertne.png"
                        alt={t("title")}
                        width={112}
                        height={112}
                        className="h-20 w-20 object-contain drop-shadow-sm sm:h-28 sm:w-28"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-lg font-extrabold text-rose-700 sm:text-xl">
                        {t("title")}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                        {t("description")}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 backdrop-blur-sm sm:text-sm">
                            <FiInfo className="h-3.5 w-3.5 shrink-0" />
                            <span>{t("badge")}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200 backdrop-blur-sm sm:text-sm">
                            <FiClock className="h-3.5 w-3.5 shrink-0" />
                            <span>{t("hours")}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
