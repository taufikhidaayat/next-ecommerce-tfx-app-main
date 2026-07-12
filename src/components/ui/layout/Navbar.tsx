'use client';

import { FaInstagram } from "react-icons/fa";
import { useTranslations } from "next-intl";

// Bar navigasi atas toko: logo, pencarian, keranjang, menu profil, pemilih bahasa.
export default function Navbar() {
    const t = useTranslations("home.navbar");

    const handleScrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const headerOffset = 80;
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    const openSupport = () =>
        window.open(t("supportEmailUrl"), "_blank", "noopener,noreferrer");

    return (
        <nav>
            {/* MOBILE: chip yang bisa digeser horizontal */}
            <div className="md:hidden -mx-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    <button
                        onClick={() => handleScrollToSection("products")}
                        className="shrink-0 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
                    >
                        {t("products")}
                    </button>
                    <button
                        onClick={() => handleScrollToSection("categories")}
                        className="shrink-0 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
                    >
                        {t("categories")}
                    </button>
                    <button
                        onClick={() => handleScrollToSection("brands")}
                        className="shrink-0 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
                    >
                        {t("brands")}
                    </button>
                    <button
                        onClick={() => handleScrollToSection("faqs")}
                        className="shrink-0 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
                    >
                        {t("faqs")}
                    </button>
                    <button
                        onClick={openSupport}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
                    >
                        <FaInstagram className="h-4 w-4" />
                        <span>{t("emailSupport")}</span>
                    </button>
                </div>
            </div>

            {/* DESKTOP: layout asli (tidak diubah) */}
            <div className="hidden md:block">
                <div className="container px-4 mx-auto py-1.5 flex justify-between items-center">
                    {/* Left Side: Navigation Links */}
                    <div className="flex space-x-6">
                        <button
                            onClick={() => handleScrollToSection("products")}
                            className="font-medium text-base text-emerald-800 hover:text-emerald-600"
                        >
                            {t("products")}
                        </button>
                        <button
                            onClick={() => handleScrollToSection("categories")}
                            className="font-medium text-base text-emerald-800 hover:text-emerald-600"
                        >
                            {t("categories")}
                        </button>
                        <button
                            onClick={() => handleScrollToSection("brands")}
                            className="font-medium text-base text-emerald-800 hover:text-emerald-600"
                        >
                            {t("brands")}
                        </button>
                    </div>

                    {/* Right Side: Utilities */}
                    <div className="flex space-x-6 items-center">
                        <button
                            onClick={() => handleScrollToSection("faqs")}
                            className="font-medium text-base text-emerald-800 hover:text-emerald-600"
                        >
                            {t("faqs")}
                        </button>
                        <button
                            onClick={openSupport}
                            className="flex items-center space-x-1 bg-orange-500 text-white px-4 py-1.5 rounded-full font-medium text-base hover:bg-orange-600 shadow-sm"
                        >
                            <FaInstagram className="w-4 h-4" />
                            <span>{t("emailSupport")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
