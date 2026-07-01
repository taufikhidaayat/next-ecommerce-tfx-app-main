import { apiClient } from "@/lib/client/axios-client";
import { UpdatePaymentMethodInput } from "@/types/order/updatePaymentMethodInput";

export const updatePaymentMethod = async (
  orderId: string | undefined,
  payload: UpdatePaymentMethodInput
) => {
  const response = await apiClient.put(`/orders/${orderId}`, payload);
  return response.data;
};