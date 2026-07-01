import { OrderStatus } from "@/enum/orderStatus";
import { MetaData } from "../metadata";
import { Order } from "./order";

export interface OrdersByUserIdResponse {
    status: string;
    message: string;
    data: {
        orders: Order[];
        statusCounts: Record<OrderStatus, number>;
        meta: MetaData;
    }
}
