import { apiClient } from "@/lib/client/axios-client";
import { UpdateCartInput } from "@/types/cart/updateCartInput";

export const updateCart = async ({ id, quantity }: UpdateCartInput) => {
  const response = await apiClient.put(`/cart/${id}`, {
    quantity,
  });
  return response.data;
};