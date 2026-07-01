import { apiClient } from "@/lib/client/axios-client";
import { ForgotPasswordInput } from "@/types/user/forgotPasswordInput";
import { AxiosError } from "axios";

export const forgotPassword = async (payload: ForgotPasswordInput) => {
  try {
    const response = await apiClient.post("/user/forgot-password", payload);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || "Forgot password request failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred");
  }
};