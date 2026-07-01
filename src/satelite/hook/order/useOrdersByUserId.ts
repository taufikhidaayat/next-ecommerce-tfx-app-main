import { apiClient } from "@/lib/client/axios-client";
import { FetchParams } from "@/types/fetchParams";
import { OrdersByUserIdResponse } from "@/types/order/ordersByUserIdResponse";
import { buildQueryString } from "@/utils/buildQueryString";

export const fetchOrdersByUserId = async (
    query?: FetchParams
): Promise<OrdersByUserIdResponse> => {
    const queryString = buildQueryString(query || {});
    const response = await apiClient.get<OrdersByUserIdResponse>(`/orders/user?${queryString}`);
    return response.data;
};