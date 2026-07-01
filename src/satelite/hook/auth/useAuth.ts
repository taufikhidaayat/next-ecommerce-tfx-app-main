import { apiClient } from "@/lib/client/axios-client";
import { DecodedToken } from "@/types/decodedToken";
import { AxiosError } from "axios";

export const fetchProfile = async (): Promise<DecodedToken> => {
    try {
        const response = await apiClient.get<{ user: DecodedToken }>("/auth/profile");
        return response.data.user;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
                throw new Error("Authentication required. Please log in.");
            }
            throw new Error(error.response?.data?.message || "Authentication failed. Please try again later.");
        }
        throw new Error("Authentication failed. Please try again later.");
    }
};
