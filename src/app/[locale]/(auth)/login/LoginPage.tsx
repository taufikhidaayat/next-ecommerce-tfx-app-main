"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/satelite/services/authService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Image from "next/image";
import ForgotPasswordRequestModal from "@/components/modal/ForgotPasswordRequestModal";
import { useTranslations } from "next-intl";

export default function Login() {
    const t = useTranslations("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isModalForgotPasswordOpen, setIsModalForgotPasswordOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = pathname.split("/")[1] || "id";

    const { mutate: loginMutation, isPending } = useLogin();
    const queryClient = useQueryClient();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error(t("fillAllFields"));
            return;
        }

        loginMutation({ email, password }, {
            onSuccess: () => {
                toast.success(t("success"));
                // Tandai status login lebih dulu agar header tidak menampilkan
                // tombol "Masuk" berkedip saat status auth sedang dimuat ulang.
                try { localStorage.setItem("tl_logged_in", "1"); } catch { /* abaikan */ }
                // Segarkan cache auth agar navbar langsung berubah ke tampilan
                // login (avatar, keranjang, poin) tanpa perlu refresh manual.
                queryClient.invalidateQueries({ queryKey: ["profile"] });
                queryClient.invalidateQueries({ queryKey: ["user"] });
                queryClient.invalidateQueries({ queryKey: ["point-balance"] });
                router.push(`/${currentLocale}`);
            },
            onError: () => {
                toast.error(t("failed"));
            },
        });
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12 bg-gradient-to-br from-gray-50 via-white to-emerald-50/40 overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 -left-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-32 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex w-full max-w-2xl sm:max-w-5xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 bg-white border border-gray-100">
                {/* Left Panel (Desktop Only) */}
                <div className="hidden md:flex relative w-0 md:w-2/5 flex-col justify-center items-start text-white bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 p-8 lg:p-10 overflow-hidden">
                    {/* Decorative blobs inside panel */}
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none" />

                    {/* Gold accent line top */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                    {/* Subtle pattern */}
                    <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none">
                        <Image
                            src="/images/patterns/abstract.png"
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 40vw"
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 w-full">
                        <h2 className="text-2xl lg:text-4xl font-bold mb-3 leading-[1.15] tracking-tight">
                            {t("newHere")}
                        </h2>
                        <p className="text-sm text-emerald-100/80 leading-relaxed mb-6">
                            {t("createAccount")}
                        </p>
                        <Link href="/register">
                            <button
                                disabled={isPending}
                                className={`group/reg relative w-full px-6 py-3 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300
                                    ${isPending
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-white/10 backdrop-blur-sm border border-white/25 text-white hover:bg-white hover:text-emerald-800 hover:border-white hover:shadow-xl hover:shadow-amber-500/20"
                                    }`}
                            >
                                {!isPending && (
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/reg:translate-x-full transition-transform duration-700" />
                                )}
                                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                                    {t("createAccountButton")}
                                    <svg className="w-4 h-4 transition-transform duration-300 group-hover/reg:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full md:w-3/5 flex items-center justify-center bg-white px-5 sm:px-10 py-8 sm:py-12">
                    <div className="w-full max-w-xs sm:max-w-sm space-y-5 sm:space-y-6">
                        {/* Heading */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-6 h-px bg-emerald-500" />
                                <Image
                                    src="/images/icon_texttoko.png"
                                    alt="Toko Langgananku"
                                    width={366}
                                    height={36}
                                    className="h-4 w-auto object-contain"
                                    priority
                                />
                                <span className="w-6 h-px bg-emerald-500" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                {t("welcome")}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                {t("subtitle")}
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                                    {t("email")} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors text-base pointer-events-none" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        disabled={isPending}
                                        className="w-full pl-10 pr-3 py-3 sm:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-base text-emerald-700 placeholder:text-gray-400 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                                    {t("password")} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors text-base pointer-events-none" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isPending}
                                        className="w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-base text-emerald-700 placeholder:text-gray-400 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalForgotPasswordOpen(true)}
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors"
                                >
                                    {t("forgotPassword")}
                                </button>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className={`group/btn relative w-full py-3 rounded-xl text-white font-semibold text-sm overflow-hidden transition-all duration-300
                                    ${isPending
                                        ? "bg-red-600 cursor-not-allowed opacity-70"
                                        : "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-700/25 hover:shadow-xl hover:shadow-red-700/40 hover:-translate-y-0.5"
                                    }`}
                            >
                                {!isPending && (
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                )}
                                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                                    {isPending ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            {t("loggingIn")}
                                        </>
                                    ) : (
                                        t("loginButton")
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* REGISTER BUTTON MOBILE */}
                        <div className="md:hidden">
                            <div className="flex items-center gap-3 my-5">
                                <span className="flex-1 h-px bg-gray-200" />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{t("newHere")}</span>
                                <span className="flex-1 h-px bg-gray-200" />
                            </div>
                            <Link href="/register">
                                <button
                                    disabled={isPending}
                                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
                                        ${isPending
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-700 hover:text-white hover:shadow-lg hover:shadow-emerald-700/20"
                                        }`}
                                >
                                    {t("createAccountButton")}
                                </button>
                            </Link>
                        </div>

                        {/* Back to home */}
                        <Link
                            href="/"
                            className="group/back flex justify-center items-center text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                            <FaArrowLeft className="mr-1.5 text-xs transition-transform duration-300 group-hover/back:-translate-x-0.5" />
                            {t("backToDashboard")}
                        </Link>
                    </div>
                </div>
            </div>

            <ForgotPasswordRequestModal
                isOpen={isModalForgotPasswordOpen}
                onClose={() => setIsModalForgotPasswordOpen(false)}
            />
        </div>
    );
}
