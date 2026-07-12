import { FetchParams } from "@/types/fetchParams";
import { fetchBrands } from "../hook/brand/useBrands";
import { QueryFunctionContext, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { BrandsResponse } from "@/types/brand/brandsResponse";

// Service brand sisi toko (baca daftar/detail merek untuk filter & halaman produk).
// Pola React Query sama seperti di CMS.
export const useBrands = (params: FetchParams) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: ({ queryKey }: QueryFunctionContext) => {
      const [, params] = queryKey as [string, FetchParams];
      return fetchBrands(params);
    },
  });
};

export const useAllBrands = (params: FetchParams) => {
  return useInfiniteQuery<BrandsResponse, Error>({
    queryKey: ['brands', params],
    queryFn: ({ pageParam = 1 }: QueryFunctionContext) => {
      const updatedParams = { ...params, page: pageParam as number, limit: params.limit ?? 10 };
      return fetchBrands(updatedParams);
    },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage.data;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
