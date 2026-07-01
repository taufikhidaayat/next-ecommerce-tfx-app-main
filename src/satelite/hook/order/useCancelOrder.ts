import { apiClient } from "@/lib/client/axios-client";

export const cancelOrder = async (orderId: string) => {
    const response = await apiClient.put(`/orders/cancel/${orderId}`);
    return response.data;
};
