import { Cart } from "./cart";

export interface CartsByUserIdResponse {
    status: string;
    message: string;
    data: {
        itemOrder: Cart[];
    }
}