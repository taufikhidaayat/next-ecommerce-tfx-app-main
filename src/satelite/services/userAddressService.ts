import { UserAddressInput, UserAddressResponse, UserAddressSingleResponse } from "@/types/user/userAddress";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    fetchUserAddresses,
    createUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultUserAddress,
} from "../hook/user/useUserAddress";

export const useUserAddresses = () => {
    return useQuery<UserAddressResponse, Error>({
        queryKey: ["user-addresses"],
        queryFn: () => fetchUserAddresses(),
    });
};

export const useCreateUserAddress = () => {
    return useMutation<UserAddressSingleResponse, Error, UserAddressInput>({
        mutationFn: (data) => createUserAddress(data),
    });
};

export const useUpdateUserAddress = () => {
    return useMutation<UserAddressSingleResponse, Error, { id: string; data: Partial<UserAddressInput> }>({
        mutationFn: ({ id, data }) => updateUserAddress(id, data),
    });
};

export const useDeleteUserAddress = () => {
    return useMutation<UserAddressSingleResponse, Error, string>({
        mutationFn: (id) => deleteUserAddress(id),
    });
};

export const useSetDefaultUserAddress = () => {
    return useMutation<UserAddressSingleResponse, Error, string>({
        mutationFn: (id) => setDefaultUserAddress(id),
    });
};
