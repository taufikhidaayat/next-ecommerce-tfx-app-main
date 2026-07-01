import { Product } from "../product/product";

export interface Cart {
    id?: string;
    productId: string;
    quantity: number;
    priceType: string;
    createdAt?: string;
    updatedAt?: string;
    product: Product;
}