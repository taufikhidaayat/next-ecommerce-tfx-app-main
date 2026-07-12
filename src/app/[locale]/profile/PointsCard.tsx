"use client";

import { useRouter } from "next/navigation";
import { FaCoins } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useTranslations } from "next-intl";
import { usePointBalance } from "@/satelite/services/pointService";

// Kartu ringkas saldo poin di profil, dengan tautan ke halaman riwayat poin lengkap.
export default function PointsCard() {
    const router = useRouter();
    const t = useTranslations("profile.points");
    const { data, isPending } = usePointBalance();

    const balance = data?.data?.points ?? 0;

    return (
        <div
            onClick={() => router.push("/profile/points")}
            style={{ background: "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)" }}
            className="group rounded-2xl shadow-md py-5 px-7 text-white mb-5 cursor-pointer hover:brightness-105 hover:shadow-lg active:scale-[0.98] transition-all duration-150"
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wide opacity-90 flex items-center gap-1.5">
                        <FaCoins className="w-3.5 h-3.5" />
                        {t("title")}
                    </div>
                    <div className="text-3xl font-bold mt-1.5">
                        {isPending ? "..." : balance.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                        {t("description")}
                    </div>
                </div>
                <IoIosArrowForward className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1.5" />
            </div>
        </div>
    );
}
