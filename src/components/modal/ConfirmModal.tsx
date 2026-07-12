"use client";

import { ReactNode, useEffect, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useTranslations } from "next-intl";

type ConfirmVariant =
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "link"
    | "ghost";

type ConfirmModalProps = {
    open: boolean;
    loading?: boolean;
    title?: string;
    message?: ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmVariant?: ConfirmVariant;
    onConfirm: () => void;
    onCancel: () => void;
};

type VariantStyle = {
    iconBg: string;
    confirmBtn: string;
    icon: ReactNode;
};

const VARIANT_STYLES: Record<ConfirmVariant, VariantStyle> = {
    primary: {
        iconBg: "bg-emerald-100",
        confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
        icon: <FaCheckCircle className="w-6 h-6 text-emerald-600" />,
    },
    success: {
        iconBg: "bg-emerald-100",
        confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
        icon: <FaCheckCircle className="w-6 h-6 text-emerald-600" />,
    },
    danger: {
        iconBg: "bg-red-100",
        confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
        icon: <FaExclamationTriangle className="w-6 h-6 text-red-600" />,
    },
    warning: {
        iconBg: "bg-amber-100",
        confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
        icon: <FaExclamationTriangle className="w-6 h-6 text-amber-600" />,
    },
    info: {
        iconBg: "bg-blue-100",
        confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: <FaInfoCircle className="w-6 h-6 text-blue-600" />,
    },
    secondary: {
        iconBg: "bg-gray-100",
        confirmBtn: "bg-gray-700 hover:bg-gray-800 text-white",
        icon: <FaInfoCircle className="w-6 h-6 text-gray-600" />,
    },
    link: {
        iconBg: "bg-blue-100",
        confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: <FaInfoCircle className="w-6 h-6 text-blue-600" />,
    },
    ghost: {
        iconBg: "bg-gray-100",
        confirmBtn: "bg-gray-700 hover:bg-gray-800 text-white",
        icon: <FaInfoCircle className="w-6 h-6 text-gray-600" />,
    },
};

// Popup konfirmasi generik ("Yakin?") sisi toko, dipakai sebelum aksi penting
// (mis. batalkan pesanan, hapus alamat). Sepadan dengan ConfirmModal di CMS.
export default function ConfirmModal({
    open,
    loading = false,
    title,
    message,
    confirmButtonText,
    cancelButtonText,
    confirmVariant = "success",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const t = useTranslations("confirmModal");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useScrollLock(open);

    if (!mounted || !open) return null;

    const styles = VARIANT_STYLES[confirmVariant];

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 animate-fade-in"
            onClick={loading ? undefined : onCancel}
        >
            <div
                className="w-full max-w-md mx-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg}`}>
                        {styles.icon}
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                        {title ?? t("title")}
                    </h3>

                    <div className="mb-6 text-sm text-gray-600">
                        {message ?? t("message")}
                    </div>

                    <div className="flex w-full justify-center gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            {cancelButtonText ?? t("cancelButton")}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles.confirmBtn}`}
                        >
                            {loading && <FaSpinner className="animate-spin" />}
                            {loading ? t("processing") : (confirmButtonText ?? t("confirmButton"))}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
