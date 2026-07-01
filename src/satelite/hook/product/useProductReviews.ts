import { FetchParams } from "@/types/fetchParams";
import { buildQueryString } from "@/utils/buildQueryString";
import { apiClient } from "@/lib/client/axios-client";
import { ProductReviewsResponse } from "@/types/product/productReviewsResponse";

export const fetchProductReviews = async (
    productId: string,
    query?: FetchParams
): Promise<ProductReviewsResponse> => {
    const queryString = buildQueryString(query || {});
    const response = await apiClient.get<ProductReviewsResponse>(`/product/${productId}/reviews?${queryString}`);
    return response.data;
};
