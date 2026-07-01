import { OrderStatus } from "@/enum/orderStatus";
import { PaymentStatus } from "@/enum/paymentStatus";
import { useTranslations } from "next-intl";

type OrderStatusBadgeProps = {
    status: OrderStatus;
    payementStatus?: PaymentStatus;
};

export default function OrderStatusBadge({ status, payementStatus }: OrderStatusBadgeProps) {
    const t = useTranslations("orderStatus");
    const statusStyles: Record<OrderStatus, {
        label: string;
        bg: string;
        text: string;
        border: string;
        dot: string;
    }> = {
        PENDING: {
            label: t("pending"),
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            border: "border-yellow-300",
            dot: "bg-yellow-400",
        },
        PAID: {
            label: t("paid"),
            bg: "bg-blue-100",
            text: "text-blue-800",
            border: "border-blue-300",
            dot: "bg-blue-500",
        },
        PROCESSING: {
            label: t("processing"),
            bg: "bg-orange-100",
            text: "text-orange-800",
            border: "border-orange-300",
            dot: "bg-orange-500",
        },
        READY_FOR_PICKUP: {
            label: t("readyForPickup"),
            bg: "bg-teal-100",
            text: "text-teal-800",
            border: "border-teal-300",
            dot: "bg-teal-500",
        },
        SHIPPED: {
            label: t("shipped"),
            bg: "bg-purple-100",
            text: "text-purple-800",
            border: "border-purple-300",
            dot: "bg-purple-500",
        },
        ON_DELIVERY: {
            label: t("onDelivery"),
            bg: "bg-indigo-100",
            text: "text-indigo-800",
            border: "border-indigo-300",
            dot: "bg-indigo-500",
        },
        DELIVERED: {
            label: t("delivered"),
            bg: "bg-emerald-100",
            text: "text-emerald-800",
            border: "border-emerald-300",
            dot: "bg-emerald-500",
        },
        COMPLETED: {
            label: t("completed"),
            bg: "bg-green-100",
            text: "text-green-800",
            border: "border-green-300",
            dot: "bg-green-500",
        },
        CANCELLED: {
            label: t("cancelled"),
            bg: "bg-red-100",
            text: "text-red-800",
            border: "border-red-300",
            dot: "bg-red-500",
        },
    };

    let { label, bg, text, border, dot } = statusStyles[status];

    if (status === OrderStatus.PENDING && payementStatus === PaymentStatus.PENDING) {
        bg = "bg-yellow-50";
        text = "text-yellow-900";
        border = "border-yellow-500";
        dot = "bg-yellow-600";
        label = t("verifying");
    }

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs md:text-sm font-medium ${bg} ${text} border ${border}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
        </span>
    );
}
