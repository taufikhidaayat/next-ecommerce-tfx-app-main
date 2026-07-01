import { buildQueryString } from "@/utils/buildQueryString";
import { FetchParams } from "@/types/fetchParams";
import { BrandsResponse } from "@/types/brand/brandsResponse";
import { apiClient } from "@/lib/client/axios-client";

export const fetchBrands = async (
    query?: FetchParams
): Promise<BrandsResponse> => {
    const queryString = buildQueryString(query || {});
    const response = await apiClient.get<BrandsResponse>(`/brands?${queryString}`);
    return response.data;
};
