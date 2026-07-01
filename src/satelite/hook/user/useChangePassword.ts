import { apiClient } from "@/lib/client/axios-client";
import { AxiosError } from "axios";

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await apiClient.put("/user/change-password", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to change password."
      );
    }
    throw new Error("Failed to change password.");
  }
};
