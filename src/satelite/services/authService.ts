import { useMutation, useQuery } from "@tanstack/react-query";
import { login } from "../hook/auth/useLogin";
import { fetchProfile } from "../hook/auth/useAuth";
import { DecodedToken } from "@/types/decodedToken";
import { CreateUpdateUserInput } from "@/types/user/createUpdateUserInput";
import { registration } from "../hook/auth/useRegistration";
import { verify } from "../hook/auth/useVerify";
import { FetchParams } from "@/types/fetchParams";
import { ForgotPasswordInput } from "@/types/user/forgotPasswordInput";
import { forgotPassword } from "../hook/auth/useforgotPassword";
import { verifyResetToken } from "../hook/auth/useVerifyResetToken";
import { ResetPasswordInput } from "@/types/user/resetPasswordInput";
import { resetPassword } from "../hook/auth/useResetPassword ";

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      login(credentials),
  });
};

export const useRegistration = () => {
  return useMutation({
    mutationFn: (credentials: CreateUpdateUserInput) =>
      registration(credentials),
  });
};

export const useVerify = () => {
  return useMutation({
    mutationFn: (params: FetchParams) => verify(params),
  });
};

export const useAuth = () => {
  return useQuery<DecodedToken>({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) => forgotPassword(payload),
  });
};

export const useVerifyResetToken = () => {
  return useMutation({
    mutationFn: (token: string) => verifyResetToken(token),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordInput) => resetPassword(payload),
  });
};