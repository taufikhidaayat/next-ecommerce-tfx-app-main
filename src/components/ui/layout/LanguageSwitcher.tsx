"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/lib/i18n";
import { HiGlobeAlt } from "react-icons/hi";

const languageLabels: Record<string, { short: string; label: string }> = {
    id: { short: "ID", label: "Indonesia" },
    en: { short: "EN", label: "English" },
    jv: { short: "JV", label: "Basa Jawa" },
};

type Props = {
    onOpenChange?: (open: boolean) => void;
    forceClose?: boolean;
};

// Pemilih bahasa: dropdown daftar bahasa; memilih satu akan menyimpan pilihan (cookie)
// dan memuat ulang halaman dengan awalan bahasa baru di URL (/id, /en, dst).
export default function LanguageSwitcher({ onOpenChange, forceClose }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    const currentLocale = pathname.split("/")[1] || "id";

    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    useEffect(() => {
        if (forceClose) setIsOpen(false);
    }, [forceClose]);

    const handleSwitch = (locale: string) => {
        const segments = pathname.split("/");
        if (locales.includes(segments[1] as typeof locales[number])) {
            segments[1] = locale;
        } else {
            segments.splice(1, 0, locale);
        }
        document.cookie = `language=${locale};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
        router.replace(segments.join("/"));
        setIsOpen(false);
    };

    const current = languageLabels[currentLocale] || languageLabels["id"];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition text-gray-700"
                aria-label="Ganti bahasa"
            >
                <HiGlobeAlt className="text-lg text-[#0B4540]" />
                <span className="text-xs font-semibold">{current.short}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 z-50">
                    <div className="absolute right-4 -top-2 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200"></div>
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        <ul className="py-1.5">
                            {locales.map((locale) => {
                                const lang = languageLabels[locale];
                                const isActive = locale === currentLocale;
                                return (
                                    <li key={locale}>
                                        <button
                                            onClick={() => handleSwitch(locale)}
                                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                                                isActive
                                                    ? "bg-emerald-50 text-emerald-700 font-medium"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span>{lang?.label || locale}</span>
                                            <span className="text-xs text-gray-400 font-mono">{lang?.short || locale.toUpperCase()}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
