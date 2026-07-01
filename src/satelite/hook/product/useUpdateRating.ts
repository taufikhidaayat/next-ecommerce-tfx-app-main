import { apiClient } from "@/lib/client/axios-client";
import { RatingInput } from "@/types/product/ratingInput";

export const updateRating = async (data: RatingInput) => {
  const response = await apiClient.post(`/product/${data.productId}/rating`, data);
  return response.data;
};