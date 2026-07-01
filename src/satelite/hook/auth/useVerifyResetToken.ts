import { apiClient } from "@/lib/client/axios-client";
import { AxiosError } from "axios";

export const verifyResetToken = async (token: string) => {
  try {
    const response = await apiClient.get(`/user/reset-password/verify?token=${token}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || "Token verification failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred");
  }
};