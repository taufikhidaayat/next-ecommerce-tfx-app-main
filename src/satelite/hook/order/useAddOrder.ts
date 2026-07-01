import { apiClient } from "@/lib/client/axios-client";
import { CreateOrderInput } from "@/types/order/createOrderInput";

export const addOrder = async (
    order: CreateOrderInput
) => {
    const response = await apiClient.post(
        `/orders`,
        order
    );
    return response.data.data;
};