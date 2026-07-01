import { apiClient } from "@/lib/client/axios-client";
import { CreateUpdateUserInput } from "@/types/user/createUpdateUserInput";
import { AxiosError } from "axios";

export const registration = async (credentials: CreateUpdateUserInput) => {

    try {
        const response = await apiClient.post(
            "/user/register",
            credentials,
        );
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || "Registration failed";
            throw new Error(message);
        }
        throw new Error("Unexpected error occurred");
    }
};
