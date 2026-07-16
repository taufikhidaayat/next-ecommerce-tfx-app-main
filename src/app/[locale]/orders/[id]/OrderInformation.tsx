import { OrderType } from "@/enum/orderType";
import { Order } from "@/types/order/order";
import { User } from "@/types/user/user";
import { formatDateAndTimeForUser } from "@/utils/formatDateAndTimeForUser";
import { useTranslations, useLocale } from "next-intl";
import { FaStore, FaTruck, FaUser, FaPhoneAlt } from "react-icons/fa";

type Props = {
  order: Order;
  user: User;
};

// Info pesanan di halaman detail: nomor order, tanggal, tipe (ambil/kirim), dan
// alamat/penerima bila delivery.
export default function OrderInformation({ order, user }: Props) {
  const t = useTranslations("orderDetail.info");
  const td = useTranslations("delivery");
  const locale = useLocale();

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-green-700">{t("title")}</h2>
        <hr className="mt-2 border-gray-200" />
      </div>

      <div className="text-xs sm:text-sm text-gray-700 space-y-2 font-bold">
        <div className="flex justify-between">
          <span className="font-medium">{t("orderNumber")}</span>
          <span>{order.orderId}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">{t("orderDate")}</span>
          <span>{formatDateAndTimeForUser(order.createdAt, locale)}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">{t("lastUpdated")}</span>
          <span>{formatDateAndTimeForUser(order.updatedAt, locale)}</span>
        </div>

        {user.name && (
          <div className="flex justify-between">
            <span className="font-medium">{t("customerName")}</span>
            <span>{user.name}</span>
          </div>
        )}

        {/* Order Type Badge */}
        <div className="flex justify-between items-center">
          <span className="font-medium">{td("orderType")}</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            order.orderType === OrderType.DELIVERY
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {order.orderType === OrderType.DELIVERY ? (
              <><FaTruck size={11} /> {td("delivery")}</>
            ) : (
              <><FaStore size={11} /> {td("pickup")}</>
            )}
          </span>
        </div>
      </div>

      {/* Delivery Info Section */}
      {order.orderType === OrderType.DELIVERY && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <h3 className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
            <FaTruck size={13} /> {td("deliveryInfo")}
          </h3>

          {/* Data pengantar — muncul saat pesanan mulai diantar */}
          {order.courierName && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600 flex items-center gap-1.5">
                  <FaUser size={11} /> {td("courierName")}
                </span>
                <span className="font-bold text-gray-800">{order.courierName}</span>
              </div>
              {order.courierPhone && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600 flex items-center gap-1.5">
                    <FaPhoneAlt size={10} /> {td("courierPhone")}
                  </span>
                  <a href={`tel:${order.courierPhone}`} className="font-bold text-indigo-600 hover:underline">
                    {order.courierPhone}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="text-xs sm:text-sm text-gray-700 space-y-2">
            {order.deliveryPhone && (
              <div className="flex justify-between">
                <span className="font-medium">{td("phone")}</span>
                <span className="font-bold">{order.deliveryPhone}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div>
                <span className="font-medium">{td("address")}</span>
                <p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded-lg">{order.deliveryAddress}</p>
              </div>
            )}
            {order.deliveryNotes && (
              <div>
                <span className="font-medium">{td("deliveryNotes")}</span>
                <p className="mt-1 text-gray-600 bg-amber-50 p-2 rounded-lg italic">{order.deliveryNotes}</p>
              </div>
            )}
            {order.deliveryDistance != null && (
              <div className="flex justify-between">
                <span className="font-medium">{td("distanceToStore")}</span>
                <span className="font-bold">{order.deliveryDistance} km</span>
              </div>
            )}
            {order.deliveryProofUrl && (
              <div>
                <span className="font-medium">{td("deliveryProof")}</span>
                <img
                  src={order.deliveryProofUrl}
                  alt="Delivery proof"
                  className="mt-2 w-full max-w-xs rounded-xl border shadow-sm"
                />
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="font-medium">{td("deliveredAt")}</span>
                <span className="font-bold">{formatDateAndTimeForUser(order.deliveredAt, locale)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
