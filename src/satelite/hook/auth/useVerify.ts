import { apiClient } from "@/lib/client/axios-client";
import { FetchParams } from "@/types/fetchParams";
import { buildQueryString } from "@/utils/buildQueryString";

export const verify = async (
    query?: FetchParams
) => {
    const queryString = buildQueryString(query || {});
    const response = await apiClient.post(`/user/verify?${queryString}`);
    return response.data;
};