"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { useQueryParamManager } from "@/satelite/hook/common/useQueryParamManager";
import { useVerify } from "@/satelite/services/authService";
import { useTranslations } from "next-intl";

// Halaman verifikasi email: membaca token dari URL, mengirimnya ke server untuk
// mengaktifkan akun, lalu menampilkan hasil (berhasil/gagal) + tautan ke login.
export default function VerifyPage() {
    const t = useTranslations("verify");
    const router = useRouter();
    const params = useParams();
    const { value } = useQueryParamManager<string | undefined>({
        key: "token",
        initialValue: undefined,
    });

    const token = value as string | undefined;
    const { mutate, isPending, isSuccess, isError, data } = useVerify();

    useEffect(() => {
        if (!token || token.trim() === "") {
            router.replace(`/${params.locale ?? "id"}/login`);
            return;
        }

        mutate({ token });
    }, [token, mutate, router, params.locale]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full text-center">
                {isPending && (
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

                {isSuccess && (
                    <div className="flex flex-col items-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <FaCheck className="h-7 w-7 text-emerald-600" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">
                            {t("successTitle")}
                        </h1>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-600">
                            {data?.message || t("successMessage")}
                        </p>
                        <Link
                            href={`/${params.locale ?? "id"}/login`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
                        >
                            {t("gotoLogin")}
                            <FiArrowRight className="text-base" />
                        </Link>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <FaTimes className="h-7 w-7 text-red-600" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">
                            {t("errorTitle")}
                        </h1>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-600">
                            {t("errorMessage")}
                        </p>
                        <Link
                            href={`/${params.locale ?? "id"}/register`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]"
                        >
                            {t("gotoRegister")}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
