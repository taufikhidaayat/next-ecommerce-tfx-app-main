import { apiClient } from "@/lib/client/axios-client";
import { CreateUpdateUserInput } from "@/types/user/createUpdateUserInput";
import { AxiosError } from "axios";

export const updateUser = async (user: CreateUpdateUserInput) => {
  try {
    const response = await apiClient.put(
      `/user/profile`,
      user
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to update user profile.");
    }
    throw new Error("Failed to update user profile.");
  }
};