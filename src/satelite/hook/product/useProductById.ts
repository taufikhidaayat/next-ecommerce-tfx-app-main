import { apiClient } from "@/lib/client/axios-client";
import { ProductByIdResponse } from "@/types/product/productByIdResponse";

export const fetchProductById = async (
    productId: string | undefined
): Promise<ProductByIdResponse> => {
    const response = await apiClient.get<ProductByIdResponse>(`/product/${productId}`);
    return response.data;
};