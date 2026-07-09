"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegistration } from "@/satelite/services/authService";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import { Gender } from "@/enum/gender";
import { Language, languageOptions } from "@/enum/language";
import RegisterSuccessModal from "@/components/modal/RegisterSuccessModal";
import FormField from "@/components/ui/forms/FormField";
import CustomSelect from "@/components/ui/forms/CustomSelect";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useTranslations } from "next-intl";

export default function Register() {
    const t = useTranslations("register");

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [birthdate, setBirthdate] = useState<string>("");
    const [gender, setGender] = useState<Gender>(Gender.OTHER);
    const [languagePreference, setLanguagePreference] = useState<Language>(Language.ID);
    const [isModalSuccessOpen, setIsModalSuccessOpen] = useState<boolean>(false);

    const { mutate: registrationMutation, isPending } = useRegistration();

    const genderOptions = [
        { value: Gender.MALE, label: t("gender_male") },
        { value: Gender.FEMALE, label: t("gender_female") },
        { value: Gender.OTHER, label: t("gender_other") },
    ];

    // Label opsional dengan gaya halus (abu-abu, normal) sesuai standar form web.
    const withOptional = (text: string) => (
        <>
            {text}{" "}
            <span className="font-normal text-gray-400">({t("optional")})</span>
        </>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // birthdate, gender & languagePreference bersifat opsional — tidak diwajibkan.
        if (!email || !password || !name || !phone) {
            toast.error(t("fillAllFields"));
            return;
        }

        // Validasi format email di JS (menggantikan validasi native yang
        // dimatikan via noValidate agar submit tak terblokir diam-diam).
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error(t("invalidEmail"));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t("passwordsNotMatch"));
            return;
        }

        registrationMutation(
            {
                name,
                email,
                password,
                phone: `+62${phone}`,
                birthdate,
                gender,
                languagePreference
            },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    setIsModalSuccessOpen(true);
                },
                onError: () => {
                    toast.error(t("unexpectedError"));
                },
            }
        );
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12 bg-gradient-to-br from-gray-50 via-white to-emerald-50/40 overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 -left-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-32 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

            {/* Main Card */}
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
                            {t("alreadyMember")}
                        </h2>
                        <p className="text-sm text-emerald-100/80 leading-relaxed mb-6">
                            {t("loginToContinue")}
                        </p>
                        <Link href="/login">
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
                                    {t("continueToLogin")}
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
                        {/* Header */}
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
                                {t("title")}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                {t("subtitle")}
                            </p>
                        </div>

                        {/* Register Form */}
                        <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit} noValidate>
                            <FormField
                                label={t("name")}
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder={t("name")}
                                required
                                disabled={isPending}
                            />

                            <FormField
                                label={t("email")}
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isPending}
                            />

                            <FormField
                                label={t("phone")}
                                id="phone"
                                type="tel"
                                pattern="[0-9]{9,13}"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="81234567890"
                                required
                                prefix="+62"
                                disabled={isPending}
                            />

                            <FormField
                                label={withOptional(t("birthdate"))}
                                id="birthdate"
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                disabled={isPending}
                            />

                            <CustomSelect
                                label={withOptional(t("gender"))}
                                id="gender"
                                value={gender}
                                onChange={(v) => setGender(v as Gender)}
                                options={genderOptions}
                                placeholder={t("gender")}
                                disabled={isPending}
                            />

                            <CustomSelect
                                label={withOptional(t("language"))}
                                id="language"
                                value={languagePreference}
                                onChange={(v) => setLanguagePreference(v as Language)}
                                options={languageOptions}
                                placeholder={t("language")}
                                disabled={isPending}
                            />

                            <FormField
                                label={t("password")}
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={t("password")}
                                required
                                disabled={isPending}
                            />

                            <FormField
                                label={t("confirmPassword")}
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder={t("confirmPassword")}
                                required
                                disabled={isPending}
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className={`group/btn relative w-full py-3 rounded-xl text-white font-semibold text-sm overflow-hidden transition-all duration-300
                                    ${isPending
                                        ? "bg-emerald-600 cursor-not-allowed opacity-70"
                                        : "bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/40 hover:-translate-y-0.5"
                                    }`}
                            >
                                {!isPending && (
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                )}
                                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                                    {isPending ? (
                                        <>
                                            <AiOutlineLoading3Quarters className="animate-spin text-base" />
                                            {t("processing")}
                                        </>
                                    ) : (
                                        t("signUpButton")
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* LOGIN BUTTON MOBILE */}
                        <div className="md:hidden">
                            <div className="flex items-center gap-3 my-5">
                                <span className="flex-1 h-px bg-gray-200" />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{t("alreadyMember")}</span>
                                <span className="flex-1 h-px bg-gray-200" />
                            </div>
                            <Link href="/login">
                                <button
                                    disabled={isPending}
                                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
                                        ${isPending
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-700 hover:text-white hover:shadow-lg hover:shadow-emerald-700/20"
                                        }`}
                                >
                                    {t("continueToLogin")}
                                </button>
                            </Link>
                        </div>

                        {/* Back Link */}
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

            <RegisterSuccessModal
                isOpen={isModalSuccessOpen}
                onClose={() => setIsModalSuccessOpen(false)}
            />
        </div>
    );
}
