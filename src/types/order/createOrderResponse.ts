import { OrderItems } from "./orderItems";

export type CreateOrderResponse = {
    id: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    totalPrice: string;
    orderId: string;
    items: OrderItems[];
    createdAt: string;
    updatedAt: string;
};
