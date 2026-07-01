import { apiClient } from "@/lib/client/axios-client";
import { OrderByIdResponse } from "@/types/order/orderByIdResponse";

export const fetchOrderById = async (
    orderId: string | undefined
): Promise<OrderByIdResponse> => {
    const response = await apiClient.get<OrderByIdResponse>(`/orders/${orderId}`);
    return response.data;
};