import { User } from "../user/user";
import { HistoryOrder } from "./historyOrder";
import { OrderItems } from "./orderItems";
import { Order } from "./order";
import { Payment } from "./payment";

export interface OrderByIdResponse {
    status: string;
    message: string;
    data: {
        order: Order,
        user: User,
        items: OrderItems[],
        payment: Payment,
        histories: HistoryOrder[]
    }
}
