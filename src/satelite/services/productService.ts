import { fetchProducts } from "../hook/product/useProducts";
import { QueryFunctionContext, useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { fetchProductById } from "../hook/product/useProductById";
import { ProductByIdResponse } from "@/types/product/productByIdResponse";
import { FetchProductsParams } from "@/types/product/fetchProductParams";
import { ProductsResponse } from "@/types/product/productsResponse";
import { RatingInput } from "@/types/product/ratingInput";
import { updateRating } from "../hook/product/useUpdateRating";
import { addRating } from "../hook/product/useAddRating";
import { ProductReviewsResponse } from "@/types/product/productReviewsResponse";
import { fetchProductReviews } from "../hook/product/useProductReviews";
import { reportReview } from "../hook/product/useReportReview";
import { ReportReviewInput } from "@/types/product/reviewReport";
import { fetchFrequentlyBoughtTogether } from "../hook/product/useFrequentlyBoughtTogether";
import { FrequentlyBoughtTogetherResponse } from "@/types/product/frequentlyBoughtTogether";
import { fetchRecommendedProducts, RecommendedProductsResponse } from "../hook/product/useRecommendedProducts";
import { recordProductView } from "../hook/product/useRecordProductView";

export const useProducts = (params: FetchProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: ({ queryKey }: QueryFunctionContext) => {
      const [, params] = queryKey as [string, FetchProductsParams];
      return fetchProducts(params);
    },
  });
};

export const useAllProducts = (params: FetchProductsParams) => {
  return useInfiniteQuery<ProductsResponse, Error>({
    queryKey: ['products', params],
    queryFn: ({ pageParam = 1 }: QueryFunctionContext) => {
      const updatedParams = { ...params, page: pageParam as number, limit: params.limit ?? 10 };
      return fetchProducts(updatedParams);
    },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage.data;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useProductById = (productId: string) => {
  return useQuery<ProductByIdResponse, Error>({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId,
  });
};

export const useRecommendedProducts = (limit = 10) => {
  return useQuery<RecommendedProductsResponse, Error>({
    queryKey: ['recommended-products', limit],
    queryFn: () => fetchRecommendedProducts(limit),
    // Selalu refetch saat kembali ke homepage / fokus tab agar cepat mencerminkan
    // produk yang baru dibuka/dicari (bukan ketahan cache).
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useRecordProductView = () => {
  return useMutation({
    mutationFn: (productId: string) => recordProductView(productId),
  });
};

export const useFrequentlyBoughtTogether = (productId: string) => {
  return useQuery<FrequentlyBoughtTogetherResponse, Error>({
    queryKey: ['frequently-bought-together', productId],
    queryFn: () => fetchFrequentlyBoughtTogether(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddRating = () => {
  return useMutation({
    mutationFn: (input: RatingInput) => addRating(input),
  });
};

export const useUpdateRating = () => {
  return useMutation({
    mutationFn: (input: RatingInput) => updateRating(input),
  });
};

export const useReportReview = () => {
  return useMutation({
    mutationFn: (input: ReportReviewInput) => reportReview(input),
  });
};

export const useAllProductReviews = (productId: string, params: FetchProductsParams) => {
  return useInfiniteQuery<ProductReviewsResponse, Error>({
    queryKey: ['product-reviews', productId, params],
    queryFn: ({ pageParam = 1 }: QueryFunctionContext) => {
      const updatedParams = { ...params, page: pageParam as number, limit: params.limit ?? 10 };
      return fetchProductReviews(productId, updatedParams);
    },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage.data;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!productId,
  });
};