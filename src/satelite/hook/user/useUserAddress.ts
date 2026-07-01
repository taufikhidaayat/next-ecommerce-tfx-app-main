import { apiClient } from "@/lib/client/axios-client";
import { UserAddressInput, UserAddressResponse, UserAddressSingleResponse } from "@/types/user/userAddress";
import { AxiosError } from "axios";

export const fetchUserAddresses = async (): Promise<UserAddressResponse> => {
    try {
        const response = await apiClient.get<UserAddressResponse>(`/user/addresses`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to fetch addresses.");
        }
        throw new Error("Failed to fetch addresses.");
    }
};

export const createUserAddress = async (data: UserAddressInput): Promise<UserAddressSingleResponse> => {
    try {
        const response = await apiClient.post<UserAddressSingleResponse>(`/user/addresses`, data);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to create address.");
        }
        throw new Error("Failed to create address.");
    }
};

export const updateUserAddress = async (id: string, data: Partial<UserAddressInput>): Promise<UserAddressSingleResponse> => {
    try {
        const response = await apiClient.put<UserAddressSingleResponse>(`/user/addresses/${id}`, data);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to update address.");
        }
        throw new Error("Failed to update address.");
    }
};

export const deleteUserAddress = async (id: string): Promise<UserAddressSingleResponse> => {
    try {
        const response = await apiClient.delete<UserAddressSingleResponse>(`/user/addresses/${id}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to delete address.");
        }
        throw new Error("Failed to delete address.");
    }
};

export const setDefaultUserAddress = async (id: string): Promise<UserAddressSingleResponse> => {
    try {
        const response = await apiClient.put<UserAddressSingleResponse>(`/user/addresses/${id}/set-default`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to set default address.");
        }
        throw new Error("Failed to set default address.");
    }
};
