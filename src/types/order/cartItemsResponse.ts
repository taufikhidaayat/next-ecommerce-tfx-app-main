import { CartItems } from "./cartItems";

export interface CartItemsResponse {
    status: string;
    message: string;
    data: {
        items: CartItems[];
    }
}
