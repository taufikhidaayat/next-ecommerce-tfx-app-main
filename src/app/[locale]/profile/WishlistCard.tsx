"use client";

import { useRouter } from "next/navigation";
import { GrFavorite } from "react-icons/gr";
import { IoIosArrowForward } from "react-icons/io";
import { useTranslations } from "next-intl";
import { useWishlistIds } from "@/satelite/services/wishlistService";

// Kartu ringkas wishlist di profil, dengan tautan ke halaman daftar favorit lengkap.
export default function WishlistCard() {
    const router = useRouter();
    const t = useTranslations("wishlist");
    const { data, isPending } = useWishlistIds();

    const count = data?.data?.length ?? 0;

    return (
        <div
            onClick={() => router.push("/profile/wishlist")}
            style={{ background: "linear-gradient(135deg, #EE0979 0%, #8E2DE2 100%)" }}
            className="group rounded-2xl shadow-md py-5 px-7 text-white mb-5 cursor-pointer hover:brightness-105 hover:shadow-lg active:scale-[0.98] transition-all duration-150"
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wide opacity-90 flex items-center gap-1.5">
                        <GrFavorite className="w-3.5 h-3.5" />
                        {t("title")}
                    </div>
                    {isPending ? (
                        <div className="h-9 w-14 bg-white/30 rounded-lg animate-pulse mt-1.5" />
                    ) : (
                        <div className="text-3xl font-bold mt-1.5">{count.toLocaleString("id-ID")}</div>
                    )}
                    <div className="text-xs opacity-80 mt-1">
                        {t("cardDescription")}
                    </div>
                </div>
                <IoIosArrowForward className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1.5" />
            </div>
        </div>
    );
}
