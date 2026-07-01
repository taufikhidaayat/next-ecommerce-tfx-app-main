"use server"

import { api } from "@/lib/axios";
import { ItemsOrderByIdResponse } from "@/types/order/itemsOrderByIdResponse";

// Unused Function
export const fetchItemsOrderById = async (orderId: string | undefined): Promise<ItemsOrderByIdResponse> => {
    const response = await api.get<ItemsOrderByIdResponse>(process.env.NEXT_PUBLIC_BASE_URL + `/orders/items/${orderId}`);
    return response.data;
};