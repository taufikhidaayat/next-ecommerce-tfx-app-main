import { apiClient } from "@/lib/client/axios-client";
import { ReturnsByOrderResponse } from "@/types/order/returnByOrder";

export const fetchReturnsByOrderId = async (
    orderId: string | undefined
): Promise<ReturnsByOrderResponse> => {
    const response = await apiClient.get<ReturnsByOrderResponse>(
        `/orders/${orderId}/returns`
    );
    return response.data;
};
