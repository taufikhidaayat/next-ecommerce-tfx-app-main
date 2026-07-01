import { apiClient } from "@/lib/client/axios-client";

export const deleteCartById = async (cartId: string) => {
  const response = await apiClient.delete(`/cart/${cartId}`);
  return response.data;
};