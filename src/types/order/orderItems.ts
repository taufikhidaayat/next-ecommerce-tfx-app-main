import { PriceType } from "@/enum/priceType";
import { ProductRating } from "./productRating";

export interface OrderItems {
    id: string,
    quantity: number,
    subtotal: string,
    actualSubtotal: string,
    productName: string,
    productImageUrl: string,
    priceAtOrder: string,
    actualPriceAtOrder: string,
    priceType: PriceType,
    createdAt: string,
    updatedAt: string,
    orderId: string,
    productId: string,
    isReviewed: boolean,
    productRating?: ProductRating,
}