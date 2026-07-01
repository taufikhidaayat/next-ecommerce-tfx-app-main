import { apiClient } from "@/lib/client/axios-client";
import { Product } from "@/types/product/product";

export type RecommendedProductsResponse = {
    status: string;
    message: string;
    data: Product[];
};

export const fetchRecommendedProducts = async (
    limit = 10
): Promise<RecommendedProductsResponse> => {
    const response = await apiClient.get<RecommendedProductsResponse>(
        `/product/recommendations?limit=${limit}`
    );
    return response.data;
};
