import { apiClient } from "@/lib/client/axios-client";
import { FrequentlyBoughtTogetherResponse } from "@/types/product/frequentlyBoughtTogether";

export const fetchFrequentlyBoughtTogether = async (
    productId: string
): Promise<FrequentlyBoughtTogetherResponse> => {
    const response = await apiClient.get<FrequentlyBoughtTogetherResponse>(
        `/product/${productId}/frequently-bought-together?limit=6`
    );
    return response.data;
};
