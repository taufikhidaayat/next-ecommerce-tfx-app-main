import { OrderStatus } from "@/enum/orderStatus";
import { OrderType } from "@/enum/orderType";
import { PaymentMethod } from "@/enum/paymentMethod";
import { PaymentStatus } from "@/enum/paymentStatus";
import { OrderItems } from "./orderItems";

export interface Order {
    id: string;
    userId?: string;
    orderId?: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    totalPrice?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    paymentMethodUpdateCount: number;
    waitSeconds: number;
    items: OrderItems[];
    isExpired: boolean;
    orderType?: OrderType;
    deliveryAddress?: string;
    deliveryPhone?: string;
    deliveryNotes?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    deliveryDistance?: number;
    deliveryProofUrl?: string;
    courierName?: string;
    courierPhone?: string;
    deliveredAt?: string;
    firstPurchaseDiscount?: boolean;
    discountPercent?: number;
    discountAmount?: number;
    uniqueCode?: number;
    pointsRedeemed?: number;
    user?: {
        name?: string;
    }
}