'use client';

import OrderItemView from '@/components/card/OrderItemView';
import ModalPaymentProof from '@/components/modal/ModalPaymentProof';
import { PaymentStatus } from '@/enum/paymentStatus';
import { OrderItems } from '@/types/order/orderItems';
import { Order } from '@/types/order/order';
import React, { useState } from 'react';
import ReviewModal from '@/components/modal/ReviewModal';
import { OrderStatus } from '@/enum/orderStatus';
import { OrderType } from '@/enum/orderType';
import { isCompletedOrder } from '@/utils/isCompletedOrder';
import { FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { FiStar, FiRefreshCw, FiCreditCard } from 'react-icons/fi';
import { MdCancel } from 'react-icons/md';
import { useReorderByOrderId } from '@/satelite/services/cartService';
import { useCancelOrder } from '@/satelite/services/orderService';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/modal/ConfirmModal';
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

type OrderSummaryProps = {
    order: Order;
    items: OrderItems[];
    showPaymentModal: boolean;
    setShowPaymentModal: (show: boolean) => void;
    refetch: () => void;
};

export default function OrderSummary({ order, items, showPaymentModal, setShowPaymentModal, refetch }: OrderSummaryProps) {
    const t = useTranslations("orderDetail.summary");
    const modalT = useTranslations("orderDetail.modal");
    const toastT = useTranslations("orderDetail.toast");

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const total = Number(order.totalPrice ?? 0);
    const uniqueCode = Number(order.uniqueCode ?? 0);
    const subtotal = total - uniqueCode;
    const isUnpaid = order.paymentStatus === PaymentStatus.UNPAID;
    const canCancel = order.orderStatus === OrderStatus.PENDING && isUnpaid;
    // Pembayaran sudah dikirim, menunggu admin memverifikasi → tampilkan ucapan terima kasih.
    const isWaitingVerification = order.paymentStatus === PaymentStatus.PENDING;

    const { mutate: reorder, isPending } = useReorderByOrderId(order.id);
    const { mutate: cancelOrderMutation, isPending: isCancelling } = useCancelOrder(order.id);
    const queryClient = useQueryClient();

    const itemsToUse = items && items.length > 0 ? items : order.items ?? [];
    const totalItems = itemsToUse.length;
    const totalReviewed = itemsToUse.filter(item => item.isReviewed).length;
    const isAllItemsReviewed = Number(totalItems) > 0 && Number(totalReviewed) === Number(totalItems);
    const totalEdited = itemsToUse.filter(item => (item.productRating?.editCount ?? 0) > 0).length;
    const isAllItemsEdited = isAllItemsReviewed && totalEdited === totalItems;
    const itemsToReview = itemsToUse;

    const handleReorder = () => {
        reorder(undefined, {
            onSuccess: () => {
                setIsReorderModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ["carts"] });
                toast.success(toastT("reorderSuccess"));
            },
            onError: () => {
                toast.error(toastT("reorderFailed"));
            },
        });
    };

    const handleCancelOrder = () => {
        cancelOrderMutation(undefined, {
            onSuccess: () => {
                setIsCancelModalOpen(false);
                toast.success(toastT("cancelSuccess"));
                refetch();
            },
            onError: () => {
                toast.error(toastT("cancelFailed"));
            },
        });
    };

    const handlePaymentClick = () => {
        setShowPaymentModal(true);
    };

    const OrderAgainButton = ({ onClick }: { onClick: () => void }) => (
        <button
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm md:text-base text-white bg-green-700 hover:bg-green-800 shadow-md hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onClick}
            disabled={isPending}
        >
            <FiRefreshCw size={16} className="shrink-0" />
            <span>{t("orderAgain")}</span>
        </button>
    );

    return (
        <>
            <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border space-y-6">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-green-700">{t("title")}</h2>
                    <hr className="mt-2 border-gray-200" />
                </div>

                <div className="px-2 sm:px-4 space-y-4 pr-1 sm:pr-2">
                    {items && (
                        <OrderItemView
                            order={order}
                            orderItem={items}
                            showLess={true}
                            withBorder={false}
                            withQuantity={false}
                        />
                    )}
                </div>

                <div className="px-1 text-xs sm:text-sm text-gray-700 space-y-2 font-bold">
                    <div className="flex justify-between">
                        <span className="font-medium">{t("totalPrice")}</span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Biaya pengiriman hanya relevan untuk pesanan Antar ke Rumah */}
                    {order.orderType === OrderType.DELIVERY && (
                        <div className="flex justify-between">
                            <span className="font-medium">{t("deliveryFee")}</span>
                            <span className="text-green-700">{t("free")}</span>
                        </div>
                    )}

                    {order.firstPurchaseDiscount && order.discountAmount && (
                        <div className="flex justify-between text-amber-600">
                            <span className="font-medium flex items-center gap-1">
                                🎉 {t("firstPurchaseDiscount", { percent: order.discountPercent ?? 0 })}
                            </span>
                            <span>- Rp {Number(order.discountAmount).toLocaleString('id-ID')}</span>
                        </div>
                    )}

                    {(() => {
                        const points = Number(order.pointsRedeemed ?? 0);
                        return points > 0 ? (
                            <div className="flex justify-between text-amber-600">
                                <span className="font-medium">{t("pointsUsed")}</span>
                                <span>- Rp {points.toLocaleString('id-ID')}</span>
                            </div>
                        ) : (
                            <div className="flex justify-between">
                                <span className="font-medium">{t("pointsUsed")}</span>
                                <span>Rp 0</span>
                            </div>
                        );
                    })()}

                    <div className="flex justify-between">
                        <span className="font-medium">{t("tax")}</span>
                        <span>Rp {uniqueCode.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="px-1 flex justify-between text-base text-gray-800 font-bold border-t border-gray-200 pt-3">
                    <span>{t("total")}</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>

                {(isCompletedOrder(order.orderStatus) || order.orderStatus === OrderStatus.CANCELLED) && (
                    <div className={`flex flex-col sm:flex-row ${isCompletedOrder(order.orderStatus) ? 'gap-3' : ''}`}>
                        {isCompletedOrder(order.orderStatus) && (
                            <button
                                onClick={() => !isAllItemsEdited && setIsReviewOpen(true)}
                                disabled={isAllItemsEdited}
                                title={isAllItemsEdited ? t("reviewLocked") : undefined}
                                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-shadow
                                    ${isAllItemsEdited
                                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                                        : isAllItemsReviewed
                                            ? "bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 shadow-sm hover:shadow-md"
                                            : "bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg"
                                    }`}
                            >
                                <FiStar size={16} className="shrink-0" />
                                <span>
                                    {isAllItemsEdited
                                        ? t("reviewFinal")
                                        : isAllItemsReviewed
                                            ? t("updateReview")
                                            : t("leaveReview")}
                                </span>
                                <span className="text-sm tabular-nums">
                                    ({isAllItemsReviewed ? totalEdited : totalReviewed}/{totalItems})
                                </span>
                            </button>
                        )}
                        <OrderAgainButton onClick={() => setIsReorderModalOpen(true)} />
                    </div>
                )}

                {isUnpaid && (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        {/* Aksi utama — paling menonjol */}
                        <button
                            className="flex-[2] inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm md:text-base text-white bg-green-700 hover:bg-green-800 shadow-md hover:shadow-lg transition-shadow"
                            onClick={handlePaymentClick}
                        >
                            <FiCreditCard size={18} className="shrink-0" />
                            <span>{t("completePayment")}</span>
                        </button>
                        {/* Aksi destruktif — diredam jadi outline agar tidak bersaing dengan aksi utama */}
                        {canCancel && (
                            <button
                                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm md:text-base bg-white text-red-600 border-[3px] border-red-200 hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setIsCancelModalOpen(true)}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <MdCancel size={18} className="shrink-0" />
                                )}
                                <span>{t("cancelOrder")}</span>
                            </button>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    {isWaitingVerification && (
                        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <FaCheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-green-700 leading-relaxed">
                                {t("waitingVerificationNotice")}
                            </p>
                        </div>
                    )}

                    {isUnpaid && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <FaInfoCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700">
                                Pesanan akan dibatalkan secara otomatis dalam 24 jam apabila pembayaran belum dilakukan.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ReviewModal
                onClose={() => setIsReviewOpen(false)}
                isOpen={isReviewOpen}
                orderItem={itemsToReview}
            />

            <ConfirmModal
                open={isReorderModalOpen}
                onCancel={() => setIsReorderModalOpen(false)}
                onConfirm={handleReorder}
                loading={isPending}
                title={modalT("reorderTitle")}
                message={modalT("reorderMessage")}
                confirmButtonText={modalT("reorderConfirmButton")}
            />

            <ConfirmModal
                open={isCancelModalOpen}
                onCancel={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelOrder}
                loading={isCancelling}
                title={modalT("cancelTitle")}
                message={modalT("cancelMessage")}
                confirmButtonText={modalT("cancelConfirmButton")}
                confirmVariant="danger"
            />

            {showPaymentModal && (
                <ModalPaymentProof
                    orderId={order.id}
                    paymentMethod={order.paymentMethod}
                    totalPrice={total}
                    uniqueCode={uniqueCode}
                    onClose={() => setShowPaymentModal(false)}
                    refetch={refetch}
                />
            )}
        </>
    );
}