import { PaymentMethod } from "@/enum/paymentMethod";
import { OrderType } from "@/enum/orderType";

export type CreateOrderInput = {
    paymentMethod: PaymentMethod;
    note?: string;
    orderType?: OrderType;
    deliveryAddress?: string;
    deliveryPhone?: string;
    deliveryNotes?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    pointsToRedeem?: number;
};