import { apiClient } from "@/lib/client/axios-client";
import { FetchParams } from "@/types/fetchParams";
import { SearchResponse } from "@/types/search/searchResponse";
import { buildQueryString } from "@/utils/buildQueryString";

export const fetchSearch = async (
  query?: FetchParams
): Promise<SearchResponse> => {
  const queryString = buildQueryString(query || {});
  const response = await apiClient.get<SearchResponse>(`/search?${queryString}`);
  return response.data;
};
