import { FetchParams } from "@/types/fetchParams";
import { fetchCategories } from "../hook/category/useCategories";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { fetchCategoryById } from "../hook/category/useCategoryById";
import { CategoryByIdResponse } from "@/types/category/categoryByIdResponse";

// Service kategori sisi toko (baca daftar/detail kategori untuk filter produk).
// Pola React Query sama seperti di CMS.
export const useCategories = (params: FetchParams) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: ({ queryKey }: QueryFunctionContext) => {
      const [, params] = queryKey as [string, FetchParams];
      return fetchCategories(params);
    },
  });
};

// Unused Service
export const useCategoryById = (categoryId: string | undefined) => {
  return useQuery<CategoryByIdResponse, Error>({
    queryKey: ['category', categoryId],
    queryFn: () => fetchCategoryById(categoryId),
    enabled: !!categoryId,
  });
};