import { Product } from "../product/product";

export interface CartItems {
    id: string,
    quantity: number,
    subtotal: string,
    product: Product
    createdAt: string,
    updatedAt: string
}