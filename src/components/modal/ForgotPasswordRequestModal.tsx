"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForgotPassword } from "@/satelite/services/authService";
import { useScrollLock } from "@/hooks/useScrollLock";
import FormField from "../ui/forms/FormField";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { FaTimes, FaSpinner } from "react-icons/fa";

type ForgotPasswordRequestModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

// Modal "Lupa Password": user memasukkan email, sistem mengirim email berisi link reset.
export default function ForgotPasswordRequestModal({
    isOpen,
    onClose,
}: ForgotPasswordRequestModalProps) {
    const t = useTranslations("forgotPassword");
    const [email, setEmail] = useState("");
    const [mounted, setMounted] = useState(false);

    const { mutate: forgotPassword, isPending } = useForgotPassword();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useScrollLock(isOpen);

    const handleClose = () => {
        if (isPending) return;
        setEmail("");
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error(t("invalidEmail"));
            return;
        }

        forgotPassword(
            { email: email.trim() },
            {
                onSettled: () => {
                    toast.success(t("successMessage"));
                    setEmail("");
                    handleClose();
                },
            }
        );
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <>
            {/* Backdrop: penuhi lebar window termasuk gutter scrollbar (hindari sliver terang) */}
            <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[80] bg-black/50 animate-backdrop-in" />
            {/* Lapis pemusat: inset-0 mengecualikan gutter → modal tetap center secara visual.
                Klik area luar (di luar sheet) menutup modal. */}
            <div
                className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-zoom-in"
                >
                    {/* Header: judul hijau di tengah + X merah */}
                    <div className="relative flex items-center justify-center border-b border-gray-100 px-5 pt-5 pb-4 sm:pt-6 sm:pb-5">
                        <h3 className="text-center text-xl font-bold text-green-700">{t("title")}</h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isPending}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Body + Footer */}
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="space-y-4 px-5 py-5">
                            <p className="text-center text-sm text-gray-600">{t("description")}</p>

                            <FormField
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("emailPlaceholder")}
                            />
                        </div>

                        <div className="px-5 pb-5 sm:pb-6">
                            <button
                                type="submit"
                                disabled={isPending || !email.trim()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {isPending ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        {t("sending")}
                                    </>
                                ) : (
                                    t("sendButton")
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>,
        document.body
    );
}
