import { apiClient } from "@/lib/client/axios-client";
import { AxiosError } from "axios";

export const login = async (credentials: { email: string; password: string }) => {

    try {
        const response = await apiClient.post(
            "/user/login",
            credentials,
        );
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
                throw new Error("Invalid email or password.");
            }
            throw new Error(error.response?.data?.message || "Login failed. Please try again later.");
        }
        throw new Error("Login failed. Please try again later.");
    }
};
