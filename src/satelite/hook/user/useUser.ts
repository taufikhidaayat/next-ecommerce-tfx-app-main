import { AxiosError } from "axios";
import { UserResponse } from "@/types/user/userResponse";
import { apiClient } from "@/lib/client/axios-client";

export const fetchUser = async (): Promise<UserResponse> => {
    try {
        const response = await apiClient.get<UserResponse>(
            `/user/profile`
        );
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to fetch user profile.");
        }
        throw new Error("Failed to fetch user profile.");
    }
};
