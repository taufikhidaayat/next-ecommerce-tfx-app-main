"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useQueryParamManager } from "@/satelite/hook/common/useQueryParamManager";
import { useResetPassword, useVerifyResetToken } from "@/satelite/services/authService";
import { toast } from "react-toastify";
import FormField from "@/components/ui/forms/FormField";
import { useTranslations } from "next-intl";

// Halaman reset password: membaca token dari URL, memvalidasinya, lalu menerima
// password baru dari user dan mengirimnya ke server. Token dari email "lupa password".
export default function ResetPasswordPage() {
    const t = useTranslations("resetPassword");
    const router = useRouter();
    const params = useParams();

    const { value } = useQueryParamManager<string | undefined>({
        key: "token",
        initialValue: undefined,
    });
    const token = value as string | undefined;

    const {
        mutate: verifyToken,
        isPending: isVerifying,
        isSuccess: isTokenValid,
        isError: isTokenInvalid,
    } = useVerifyResetToken();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const {
        mutate: resetPassword,
        isPending: isResetting,
        isSuccess: isResetSuccess,
        isError: isResetError,
        error: resetError,
    } = useResetPassword();

    // Redirect if token is empty
    useEffect(() => {
        if (!token || token.trim() === "") {
            router.replace(`/${params.locale ?? "id"}/login`);
            return;
        }
        verifyToken(token);
    }, [token, verifyToken, router, params.locale]);

    // Redirect if token is invalid
    useEffect(() => {
        if (isTokenInvalid) {
            toast.error(t("tokenInvalid"));
            const timer = setTimeout(() => {
                router.replace(`/${params.locale ?? "id"}/login`);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isTokenInvalid, router, t, params.locale]);

    // Redirect if reset is successful
    useEffect(() => {
        if (isResetSuccess) {
            toast.success(t("resetSuccessToast"));
            const timer = setTimeout(() => {
                router.replace(`/${params.locale ?? "id"}/login`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isResetSuccess, router, t, params.locale]);

    const handleReset = () => {
        if (password !== confirmPassword) {
            toast.error(t("passwordsNotMatch"));
            return;
        }
        if (!token || typeof token !== "string") {
            toast.error(t("missingToken"));
            return;
        }
        resetPassword({ token, newPassword: password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
                {/* Loading State */}
                {isVerifying && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                        <p className="text-xl font-bold text-gray-800">Mohon Tunggu, Memuat...</p>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                            Kami sedang menyiapkan konten terbaik untuk Anda.
                            Proses ini mungkin membutuhkan beberapa detik.
                            Terima kasih atas kesabaran Anda!
                        </p>
                    </div>
                )}

                {/* Token Invalid */}
                {isTokenInvalid && (
                    <>
                        <FaTimesCircle className="text-red-600 text-6xl mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold text-red-700">
                            {t("tokenInvalidTitle")}
                        </h1>
                        <p className="text-gray-600 mt-3">
                            {t("redirecting")}
                        </p>
                    </>
                )}

                {/* Token Valid → Show Form */}
                {isTokenValid && !isResetSuccess && (
                    <>
                        <h1 className="text-2xl font-semibold text-emerald-700 mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {t("description")}
                        </p>

                        <div className="space-y-4 mb-4">
                            <FormField
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={t("passwordPlaceholder")}
                                required
                                disabled={isResetting}
                            />

                            <FormField
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder={t("confirmPasswordPlaceholder")}
                                required
                                disabled={isResetting}
                            />
                        </div>

                        <button
                            onClick={handleReset}
                            disabled={
                                isResetting ||
                                !password ||
                                !confirmPassword ||
                                password !== confirmPassword
                            }
                            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            {isResetting ? t("resetting") : t("resetButton")}
                        </button>
                        {isResetError && (
                            <p className="text-red-600 mt-3">
                                {(resetError as Error)?.message ||
                                    t("resetFailed")}
                            </p>
                        )}
                    </>
                )}

                {/* Success Reset */}
                {isResetSuccess && (
                    <>
                        <FaCheckCircle className="text-emerald-600 text-6xl mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold text-emerald-700">
                            {t("resetSuccessTitle")}
                        </h1>
                        <p className="text-gray-600 mt-3">
                            {t("redirecting")}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}