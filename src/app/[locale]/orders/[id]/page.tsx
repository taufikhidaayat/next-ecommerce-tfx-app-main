"use client";

import { useParams } from "next/navigation";
import OrderSummary from "./OrderSummary";
import OrderReviews from "./OrderReviews";
import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import { useOrderById } from "@/satelite/services/orderService";
import OrderInformation from "./OrderInformation";
import PaymentInformation from "./PaymentInformation";
import OrderFlow from "@/components/ui/layout/OrderFlow";
import OrderSkeleton from "@/components/skeletons/orders/OrderSkeleton";
import ErrorComponent from "@/components/ui/feedback/Error";
import { currentStep } from "@/utils/currentStep";
import HistoriesOrder from "./HistoriesOrder";
import OrderReturns from "./OrderReturns";
import ReturnInfoNotice from "./ReturnInfoNotice";
import OrderStatusBanner from "./OrderStatusBanner";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OrderStatus } from "@/enum/orderStatus";
import { FiXCircle } from "react-icons/fi";

export default function OrderPage() {
  const t = useTranslations("orderDetail.page");
  const params = useParams();
  const id = params?.id as string;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const { data: order, isPending, isError, refetch } = useOrderById(id);

  const { step, isCancelled } = order?.data?.order
    ? currentStep(order.data.order.orderStatus, order.data.order.paymentStatus, order.data.order.orderType)
    : { step: 0, isCancelled: false };

  useEffect(() => {
    const shouldLockScroll = showPaymentModal || confirmModalOpen;

    if (shouldLockScroll) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showPaymentModal, confirmModalOpen]);

  if (isError) return <ErrorComponent />;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8">
      <div className="container w-full px-2 sm:px-4 pt-3 pb-5 mx-auto">
        <Breadcrumbs
          items={[
            { label: t("breadcrumb.dashboard"), href: "/" },
            { label: t("breadcrumb.orders"), href: "/orders" },
            ...(order && order?.data?.order?.orderId
              ? [{ label: order.data.order.orderId }]
              : []),
          ]}
        />

        <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-green-800 mb-2">{t("title")}</h2>
            <p className="text-gray-600 text-sm">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {isPending && <OrderSkeleton />}

        {order && (
          <div className="flex flex-col gap-6 mt-6">
            {order.data.order.orderStatus === OrderStatus.CANCELLED && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
                <FiXCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-700">{t("cancelledBannerTitle")}</p>
                  <p className="text-xs text-red-600">{t("cancelledBannerDesc")}</p>
                </div>
              </div>
            )}
            <div className="w-full">
              <OrderFlow currentStep={step} isCancelled={isCancelled} orderType={order?.data?.order?.orderType} />
            </div>
            <ReturnInfoNotice orderStatus={order.data.order.orderStatus} />
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <OrderInformation order={order.data.order} user={order.data.user} />
                <PaymentInformation
                  order={order.data.order}
                  payment={order.data.payment}
                  refetch={refetch}
                  confirmModalOpen={confirmModalOpen}
                  setConfirmModalOpen={setConfirmModalOpen}
                />
                <HistoriesOrder histories={order.data.histories} />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <OrderSummary
                  order={order.data.order}
                  items={order.data.items}
                  showPaymentModal={showPaymentModal}
                  setShowPaymentModal={setShowPaymentModal}
                  refetch={refetch}
                />
                <OrderStatusBanner
                  orderStatus={order.data.order.orderStatus}
                  orderType={order.data.order.orderType}
                  step={step}
                  isCancelled={isCancelled}
                  deliveryAddress={order.data.order.deliveryAddress}
                  deliveredAt={order.data.order.deliveredAt}
                />
                <OrderReturns orderId={order.data.order.id} />
                <OrderReviews items={order.data.items} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}