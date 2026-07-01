import { OrderItems } from "./orderItems";

export interface ItemsOrderByIdResponse {
    status: string;
    message: string;
    data: {
        items: OrderItems[];
    }
}
