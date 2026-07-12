import { HistoryOrder } from "@/types/order/historyOrder";
import OrderTimelineItem from "@/components/card/OrderTimelineItem";
import { useTranslations } from "next-intl";

type Props = {
  histories: HistoryOrder[];
};

// Riwayat status pesanan (timeline): daftar perubahan status beserta waktu & catatannya.
export default function HistoriesOrder({ histories }: Props) {
  const t = useTranslations("orderDetail.history");

  const sortedHistories = [...histories].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  const statusMessages: Record<string, string> = {
    COMPLETED: t("completed"),
    SHIPPED: t("shipped"),
    PROCESSING: t("processing"),
    READY_FOR_PICKUP: t("readyForPickup"),
    ON_DELIVERY: t("onDelivery"),
    DELIVERED: t("delivered"),
    PAID: t("paid"),
    PENDING: t("pending"),
    CANCELLED: t("cancelled"),
  };

  const getStatusMessage = (item: HistoryOrder): string => {
    if (item.status === "PENDING" && item.notes?.toLowerCase().includes("verify")) {
      return t("paymentProofSubmitted");
    }
    return statusMessages[item.status] || item.status;
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-green-700">{t("title")}</h2>
        <hr className="mt-2 border-gray-200" />
      </div>

      <div className="ml-0 sm:ml-2">
        {sortedHistories.map((item, idx) => (
          <OrderTimelineItem
            key={item.id}
            item={item}
            title={getStatusMessage(item)}
            active={idx === 0}
            isLast={idx === sortedHistories.length - 1}
          />
        ))}
      </div>
    </div>
  );
}