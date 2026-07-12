"use client";

import Image from "next/image";
import { FiCheckCircle, FiClock, FiMapPin } from "react-icons/fi";
import { FaTruckFast, FaCheck } from "react-icons/fa6";
import { useTranslations, useLocale } from "next-intl";
import { OrderStatus } from "@/enum/orderStatus";
import { OrderType } from "@/enum/orderType";
import { formatDateAndTimeForUser } from "@/utils/formatDateAndTimeForUser";

type Props = {
  orderStatus: OrderStatus;
  orderType?: string;
  step: number;
  isCancelled: boolean;
  deliveryAddress?: string;
  deliveredAt?: string;
};

/**
 * Banner status pesanan di kolom kanan halaman detail.
 * Pesan & visual menyesuaikan tipe pesanan (Ambil di Toko vs Antar ke Rumah)
 * sehingga pelanggan delivery tidak melihat instruksi "ambil di toko".
 */
// Banner besar di atas halaman detail order yang merangkum status sekarang dengan
// kalimat & warna ramah pengguna (mis. "Menunggu pembayaran", "Sedang diantar").
export default function OrderStatusBanner({
  orderStatus,
  orderType,
  step,
  isCancelled,
  deliveryAddress,
  deliveredAt,
}: Props) {
  const t = useTranslations("orderDetail.page");
  const locale = useLocale();
  const isDelivery = orderType === OrderType.DELIVERY;

  // 1. Pembayaran disetujui, pesanan sedang disiapkan (delivery & pickup).
  if (step === 2 && !isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
        <FiCheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-700">{t("processingBannerTitle")}</p>
          <p className="text-xs text-emerald-600">
            {isDelivery ? t("processingBannerDescDelivery") : t("processingBannerDesc")}
          </p>
        </div>
      </div>
    );
  }

  // 2. Ambil di Toko, pesanan siap diambil (tidak pernah tampil untuk delivery).
  if (!isDelivery && orderStatus === OrderStatus.READY_FOR_PICKUP) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 p-5 shadow-sm">
        {/* dekorasi lingkaran lembut di latar */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/30 blur-xl" />
        <div className="relative flex items-center gap-4">
          {/* ikon pickup beranimasi */}
          <div className="relative shrink-0">
            <span className="absolute inset-0 rounded-full bg-rose-400/40 animate-ping" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 shadow-lg shadow-rose-500/30 ring-2 ring-rose-200 animate-bounce">
              <Image
                src="/images/logotoko.png"
                alt={t("readyPickupBannerTitle")}
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-emerald-800">{t("readyPickupBannerTitle")}</p>
            <p className="text-sm text-emerald-700">{t("readyPickupBannerDesc")}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 backdrop-blur-sm">
              <FiClock className="h-3.5 w-3.5" />
              <span>{t("readyPickupHours")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Antar ke Rumah, pesanan sedang diantar kurir.
  if (isDelivery && orderStatus === OrderStatus.ON_DELIVERY) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-50 p-5 shadow-sm">
        {/* dekorasi lingkaran lembut di latar */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-200/30 blur-xl" />
        <div className="relative flex items-center gap-4">
          {/* ikon truk beranimasi */}
          <div className="relative shrink-0">
            <span className="absolute inset-0 rounded-full bg-sky-400/40 animate-ping" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-200 animate-bounce">
              <FaTruckFast className="h-6 w-6" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-sky-800">{t("onDeliveryBannerTitle")}</p>
            <p className="text-sm text-sky-700">{t("onDeliveryBannerDesc")}</p>
            {deliveryAddress && (
              <div className="mt-2 flex max-w-full items-start gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 backdrop-blur-sm">
                <FiMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Antar ke Rumah, pesanan telah sampai tujuan.
  if (isDelivery && (orderStatus === OrderStatus.DELIVERED || orderStatus === OrderStatus.COMPLETED)) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 p-5 shadow-sm">
        {/* dekorasi lingkaran lembut di latar */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/30 blur-xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-200">
              <FaCheck className="h-6 w-6" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-emerald-800">{t("deliveredBannerTitle")}</p>
            <p className="text-sm text-emerald-700">{t("deliveredBannerDesc")}</p>
            {deliveredAt && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 backdrop-blur-sm">
                <FiClock className="h-3.5 w-3.5" />
                <span>
                  {t("deliveredAtLabel")}: {formatDateAndTimeForUser(deliveredAt, locale)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
