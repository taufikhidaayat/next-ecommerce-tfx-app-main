"use client";

import { AiFillHeart } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useScrollLock } from "@/hooks/useScrollLock";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function WishlistSavedSheet({ isOpen, onClose }: Props) {
    const router = useRouter();
    const tWish = useTranslations("wishlist");

    // Kunci scroll latar selama sheet terbuka (mobile bisa scroll di belakang).
    useScrollLock(isOpen);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

            {/* Mobile — bottom sheet */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl px-5 pt-4 pb-10 shadow-2xl animate-slide-up">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 shrink-0">
                            <AiFillHeart className="text-red-500" size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-base">{tWish("savedTitle")}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{tWish("savedDesc")}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { onClose(); router.push("/profile/wishlist"); }}
                        className="text-sm font-bold text-emerald-600 shrink-0 ml-4"
                    >
                        {tWish("viewAll")}
                    </button>
                </div>
            </div>

            {/* Desktop — modal tengah */}
            <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center">
                <div className="bg-white w-full max-w-sm mx-4 rounded-2xl shadow-xl overflow-hidden animate-fade-scale">
                    {/* Header */}
                    <div className="relative flex items-center justify-center bg-white px-5 pt-5 pb-4 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-green-700 text-center">{tWish("savedTitle")}</h3>
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 shrink-0">
                            <AiFillHeart className="text-red-500" size={22} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-base">{tWish("savedTitle")}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{tWish("savedDesc")}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 bg-white px-4 py-3">
                        <button
                            onClick={() => { onClose(); router.push("/profile/wishlist"); }}
                            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            {tWish("viewAll")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
