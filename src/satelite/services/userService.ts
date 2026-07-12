import { UserResponse } from "@/types/user/userResponse";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchUser } from "../hook/user/useUser";
import { CreateUpdateUserInput } from "@/types/user/createUpdateUserInput";
import { updateUser } from "../hook/user/useUpdateUser";
import { updateUserAvatar } from "../hook/user/userUpdateUserAvatar";
import { changePassword } from "../hook/user/useChangePassword";

// Service profil pelanggan (data akun sendiri, ubah profil, ganti avatar/password).
export const useUser = (options?: { enabled?: boolean }) => {
    return useQuery<UserResponse, Error>({
        queryKey: ['user'],
        queryFn: () => fetchUser(),
        enabled: options?.enabled ?? true,
    });
};

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: (user: CreateUpdateUserInput) => updateUser(user),
    });
};

export const useUpdateUserAvatar = () => {
    return useMutation({
        mutationFn: updateUserAvatar,
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            changePassword(data),
    });
};