import { formatToRupiah } from "@/utils/formatToRupiah";
import Link from "next/link";
import { useState } from "react";
import OrderStatusBadge from "../ui/layout/OrderStatusBadge";
import { formatDateAndTimeForUser } from "@/utils/formatDateAndTimeForUser";
import { GiShoppingBag } from "react-icons/gi";
import { Order } from "@/types/order/order";
import { OrderStatus } from "@/enum/orderStatus";
import { OrderType } from "@/enum/orderType";
import { isCompletedOrder } from "@/utils/isCompletedOrder";
import { OrderItems } from "@/types/order/orderItems";
import OrderItemViewCard from "./OrderItemViewCard";
import ReviewModal from "../modal/ReviewModal";
import { FaTruck, FaStore } from "react-icons/fa";
import { FiStar, FiArrowRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useTranslations, useLocale } from "next-intl";

type Props = {
    order: Order;
    orderItem?: OrderItems[];
    showLess?: boolean;
    withBorder?: boolean;
    withQuantity?: boolean;
};

export default function OrderItemView({
    order,
    orderItem,
    showLess = false,
    withBorder = true,
    withQuantity = true,
}: Props) {
    const t = useTranslations("orderList");
    const locale = useLocale();
    const [showAll, setShowAll] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const itemsToUse = orderItem && orderItem.length > 0 ? orderItem : order.items ?? [];
    const itemsToShow = showLess && !showAll ? itemsToUse.slice(0, 1) : itemsToUse;

    const totalItems = itemsToUse.length;
    const totalReviewed = itemsToUse.filter(item => item.isReviewed).length;
    const isAllItemsReviewed = totalItems > 0 && totalReviewed === totalItems;
    const totalEdited = itemsToUse.filter(item => (item.productRating?.editCount ?? 0) > 0).length;
    const isAllItemsEdited = isAllItemsReviewed && totalEdited === totalItems;
    const itemsToReview = itemsToUse;

    const renderItemList = () => (
        <div className="px-2 md:px-4 space-y-4 pr-1 md:pr-2 my-4">
            <div className="overflow-y-auto max-h-96 space-y-4 px-1 py-2">
                {itemsToShow.map((item) => (
                    <OrderItemViewCard
                        key={item.id}
                        orderItem={item}
                        withQuantity={withQuantity}
                    />
                ))}
            </div>
            {itemsToUse.length > 1 && (
                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 hover:underline underline-offset-2 transition-colors px-2 py-1 focus:outline-none"
                    >
                        <span>{showAll ? t("hide") : t("seeAll", { count: itemsToUse.length })}</span>
                        {showAll
                            ? <FiChevronUp size={16} />
                            : <FiChevronDown size={16} />
                        }
                    </button>
                </div>
            )}
        </div>
    );

    return withBorder ? (
        <div className="bg-white border rounded-xl shadow p-4 md:p-6 mb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b gap-2 md:gap-0">
                {/* Order ID + Icon */}
                <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1 w-full md:w-auto overflow-hidden">
                    <GiShoppingBag className="hidden md:inline text-2xl text-green-700 shrink-0" />
                    <span className="flex flex-col min-w-0 w-full">
                        <div className="flex items-center gap-2 w-full">
                            <h2 className="font-semibold text-base md:text-lg text-green-700 truncate flex-1 min-w-0">
                                {order.orderId}
                            </h2>
                            {/* Tipe pesanan — versi MOBILE (nempel di Order ID) */}
                            {order.orderType && (
                                <span className={`md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                                    order.orderType === OrderType.DELIVERY
                                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                }`}>
                                    {order.orderType === OrderType.DELIVERY
                                        ? <FaTruck className="text-[10px]" />
                                        : <FaStore className="text-[10px]" />
                                    }
                                    {order.orderType === OrderType.DELIVERY ? t("delivery") : t("pickup")}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatDateAndTimeForUser(order.createdAt, locale)}
                        </span>
                    </span>
                </div>
                {/* Grup badge kanan: tipe pesanan (desktop) + status, ukuran seragam & sejajar */}
                <div className="flex items-center gap-2 shrink-0 md:pl-4">
                    {/* Tipe pesanan — versi DESKTOP (digabung dengan status) */}
                    {order.orderType && (
                        <span className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap border ${
                            order.orderType === OrderType.DELIVERY
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                            {order.orderType === OrderType.DELIVERY
                                ? <FaTruck className="text-xs" />
                                : <FaStore className="text-xs" />
                            }
                            {order.orderType === OrderType.DELIVERY ? t("delivery") : t("pickup")}
                        </span>
                    )}
                    <OrderStatusBadge
                        status={order.isExpired ? OrderStatus.CANCELLED : order.orderStatus}
                        payementStatus={order.paymentStatus}
                    />
                </div>
            </div>

            {/* Item List */}
            {renderItemList()}

            {/* Footer */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t gap-2 md:gap-0">
                <p className="font-bold text-gray-900 mb-2 md:mb-0">
                    {t("total")}: {formatToRupiah(order.totalPrice)}
                </p>
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                    {isCompletedOrder(order.orderStatus) && !order.isExpired && (
                        <button
                            onClick={() => !isAllItemsEdited && setIsReviewOpen(true)}
                            disabled={isAllItemsEdited}
                            title={isAllItemsEdited ? t("reviewLocked") : undefined}
                            className={`inline-flex w-full md:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm md:text-base shadow-md transition-shadow
                                ${isAllItemsEdited
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                                    : isAllItemsReviewed
                                        ? "bg-green-700 hover:bg-green-800 hover:shadow-lg text-white"
                                        : "bg-amber-600 hover:bg-amber-700 hover:shadow-lg text-white"
                                }`}
                        >
                            <FiStar size={16} className="shrink-0" />
                            <span>
                                {isAllItemsEdited
                                    ? t("reviewFinal")
                                    : isAllItemsReviewed
                                        ? t("editReview")
                                        : t("writeReview")}
                            </span>
                            <span className="tabular-nums">
                                ({isAllItemsReviewed ? totalEdited : totalReviewed}/{totalItems})
                            </span>
                        </button>
                    )}
                    <Link href={`/orders/${order.id}`} className="w-full md:w-auto">
                        <button className="group w-full md:w-auto inline-flex items-center justify-center gap-2.5 border border-green-800 text-green-800 px-4 py-2.5 rounded-xl text-sm md:text-base hover:bg-green-100 transition-colors">
                            <span>{t("details")}</span>
                            <FiArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                    </Link>
                </div>
            </div>

            <ReviewModal
                onClose={() => setIsReviewOpen(false)}
                isOpen={isReviewOpen}
                orderItem={itemsToReview}
            />
        </div>
    ) : (
        renderItemList()
    );
}