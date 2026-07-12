import { FetchParams } from "@/types/fetchParams";
import { useQuery } from "@tanstack/react-query";
import { fetchBanners } from "../hook/banner/useBanners";

// Service banner sisi toko (baca banner promosi/slider yang tampil di beranda).
export const useBanners = (params: FetchParams) => {
  return useQuery({
    queryKey: ['banner', params],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, FetchParams];
      return fetchBanners(params);
    },
    staleTime: 1000 * 60 * 60 * 4,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};