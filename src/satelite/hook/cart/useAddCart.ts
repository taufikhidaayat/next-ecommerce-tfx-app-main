import { apiClient } from "@/lib/client/axios-client";
import { CreateCartInput } from "@/types/cart/createCartInput";

export const addCart = async (cart: CreateCartInput) => {
  const response = await apiClient.post("/cart", cart);
  return response.data;
};