import { apiClient } from "@/lib/client/axios-client";
import { CartsByUserIdResponse } from "@/types/cart/cartsByIdResponse";
import { FetchParams } from "@/types/fetchParams";
import { buildQueryString } from "@/utils/buildQueryString";

export const fetchCartsByUserId = async (
    query?: FetchParams
): Promise<CartsByUserIdResponse> => {
    const queryString = buildQueryString(query || {});
    const response = await apiClient.get<CartsByUserIdResponse>(`/cart?${queryString}`);
    return response.data;
};