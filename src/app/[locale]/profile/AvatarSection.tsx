"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BsCamera, BsCheckLg } from "react-icons/bs";
import { TiDelete } from "react-icons/ti";
import { HiShieldCheck } from "react-icons/hi2";
import ConfirmModal from "@/components/modal/ConfirmModal";

const DEFAULT_AVATAR = "/images/default-profile.png";

type AvatarSectionProps = {
    previewUrl?: string | null;
    userName?: string;
    isPendingUpdateAvatar?: boolean;
    isPendingDeleteAvatar?: boolean;
    handleUploadAvatar: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteAvatar: () => void;
};

export default function AvatarSection({
    previewUrl,
    userName,
    isPendingUpdateAvatar = false,
    isPendingDeleteAvatar = false,
    handleUploadAvatar,
    handleDeleteAvatar,
}: AvatarSectionProps) {
    const t = useTranslations("profile.avatar");
    const isPending = isPendingUpdateAvatar || isPendingDeleteAvatar;
    const hasCustomAvatar = !!previewUrl && previewUrl !== DEFAULT_AVATAR;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mobileOverlayVisible, setMobileOverlayVisible] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!mobileOverlayVisible) return;
        overlayTimerRef.current = setTimeout(() => setMobileOverlayVisible(false), 2500);
        return () => {
            if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
        };
    }, [mobileOverlayVisible]);

    const handleMobileTap = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!mobileOverlayVisible) {
            setMobileOverlayVisible(true);
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMobileOverlayVisible(false);
        handleUploadAvatar(e);
    };

    return (
        <div className="md:w-1/4 w-full" onClick={() => setMobileOverlayVisible(false)}>
            <div className="bg-gradient-to-b from-white to-emerald-50/60 rounded-3xl p-6 flex flex-col items-center shadow-md border border-emerald-100/60">

                {/* Avatar with overlays */}
                <div className="relative group">

                    {/* Avatar circle */}
                    <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-400/40 shadow-lg">
                        <Image
                            src={previewUrl || DEFAULT_AVATAR}
                            alt={t("alt")}
                            fill
                            sizes="128px"
                            className="object-cover"
                            priority
                        />

                        {/* Loading overlay */}
                        {isPending && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-emerald-200 border-t-emerald-600" />
                            </div>
                        )}

                        {!isPending && (
                            <>
                                {/* Desktop: hover overlay */}
                                <label className="hidden md:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col items-center justify-center cursor-pointer z-10 gap-1">
                                    <BsCamera className="w-6 h-6 text-white" />
                                    <span className="text-white text-[10px] font-medium">{t("change")}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isPending}
                                        className="hidden"
                                    />
                                </label>

                                {/* Mobile: tap sekali muncul overlay, tap lagi buka file picker */}
                                <div
                                    className={`md:hidden absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 gap-1 transition-opacity duration-200 cursor-pointer ${mobileOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
                                    onClick={handleMobileTap}
                                >
                                    <BsCamera className="w-6 h-6 text-white" />
                                    <span className="text-white text-[10px] font-medium">{t("change")}</span>
                                </div>

                                {/* Invisible tap area untuk tap pertama di mobile */}
                                {!mobileOverlayVisible && (
                                    <div
                                        className="md:hidden absolute inset-0 z-10"
                                        onClick={handleMobileTap}
                                    />
                                )}

                                {/* File input untuk mobile */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isPending}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>

                    {/* Verified badge — bottom-right */}
                    <div className="absolute -bottom-1 -right-1 z-20 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <BsCheckLg className="w-4 h-4 text-white" strokeWidth={1} />
                    </div>
                </div>

                {/* Nama user */}
                {userName && (
                    <h3 className="mt-5 font-bold text-gray-800 text-base text-center line-clamp-1">
                        {userName}
                    </h3>
                )}

                {/* Verified pill */}
                <span className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-100">
                    <HiShieldCheck className="w-3.5 h-3.5" />
                    {t("verified")}
                </span>

                {/* Delete button — hanya saat ada custom avatar */}
                {hasCustomAvatar && (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isPending}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <TiDelete className="w-5 h-5" />
                        {t("delete")}
                    </button>
                )}

                <ConfirmModal
                    open={showDeleteConfirm}
                    loading={isPendingDeleteAvatar}
                    title={t("deleteConfirmTitle")}
                    message={t("deleteConfirmMessage")}
                    confirmButtonText={t("delete")}
                    confirmVariant="danger"
                    onConfirm={() => {
                        setShowDeleteConfirm(false);
                        handleDeleteAvatar();
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
        </div>
    );
}
