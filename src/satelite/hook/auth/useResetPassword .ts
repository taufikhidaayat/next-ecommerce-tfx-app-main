import { apiClient } from "@/lib/client/axios-client";
import { ResetPasswordInput } from "@/types/user/resetPasswordInput";
import { AxiosError } from "axios";

export const resetPassword = async (payload: ResetPasswordInput) => {
  try {
    const response = await apiClient.post("/user/reset-password", payload);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || "Password reset failed";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred");
  }
};