import { ProductsResponse } from "@/types/product/productsResponse";
import { FetchParams } from "@/types/fetchParams";
import { buildQueryString } from "@/utils/buildQueryString";
import { apiClient } from "@/lib/client/axios-client";

export const fetchProducts = async (
    query?: FetchParams
): Promise<ProductsResponse> => {
    const queryString = buildQueryString(query || {});
    const response = await apiClient.get<ProductsResponse>(`/product?${queryString}`);
    return response.data;
};
