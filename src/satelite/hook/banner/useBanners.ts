import { apiClient } from "@/lib/client/axios-client";
import { BannersResponse } from "@/types/banner/bannersResponse";
import { FetchParams } from "@/types/fetchParams";
import { buildQueryString } from "@/utils/buildQueryString";

export const fetchBanners = async (
  query?: FetchParams
): Promise<BannersResponse> => {
  const queryString = buildQueryString(query || {});
  const response = await apiClient.get<BannersResponse>(`/banners?${queryString}`);
  return response.data;
};
