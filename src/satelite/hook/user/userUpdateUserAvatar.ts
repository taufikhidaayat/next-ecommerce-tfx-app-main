import { apiClient } from "@/lib/client/axios-client";
import { AxiosError } from "axios";

export const updateUserAvatar = async (formData: FormData) => {
    try {
        const response = await apiClient.put(
            `/user/avatar`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to update user avatar.");
        }
        throw new Error("Failed to update user avatar.");
    }
};