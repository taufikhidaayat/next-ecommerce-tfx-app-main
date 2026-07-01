"use server";

import { api } from "@/lib/axios";

// Unused Function
export const deleteCartsByUserId = async (userId: string) => {
  const response = await api.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/all/${userId}`);
  return response.data;
};