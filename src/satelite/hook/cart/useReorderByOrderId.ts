import { apiClient } from "@/lib/client/axios-client";

export const reorderByOrderId = async (id: string) => {
  const response = await apiClient.post(`/cart/reorder/${id}`);
  return response.data;
};