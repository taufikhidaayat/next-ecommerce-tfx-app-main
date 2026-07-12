"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { recordSearchQuery } from "@/satelite/hook/product/useRecordSearchQuery";

type Props = {
    query: string;
    setQuery: (val: string) => void;
    onClose: () => void;
};

// Kotak input pencarian di navbar. Nilainya dikontrol induk; membuka SearchModalBox
// untuk menampilkan saran hasil.
export default function SearchBar({ query, setQuery, onClose }: Props) {
    const router = useRouter();
    const t = useTranslations("searchBar");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = () => {
        if (!query.trim()) return;
        // Tutup keyboard mobile: klik tombol otomatis mem-blur input, tapi tekan
        // Enter tidak, jadi blur manual supaya keyboard tutup di kedua cara.
        inputRef.current?.blur();
        // Best-effort: catat pencarian sebagai sinyal rekomendasi (fire-and-forget).
        void recordSearchQuery(query.trim());
        onClose();
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleClear = () => {
        setQuery("");
        onClose();
        inputRef.current?.focus();

        // Jika sedang melihat hasil pencarian, batalkan juga pencarian aktif:
        // hapus ?search= dari URL (pertahankan filter lain seperti kategori/brand/
        // harga/sort) agar konsisten dengan tombol "Hapus Pencarian". Di halaman lain
        // yang tak punya ?search=, ini tidak melakukan navigasi apa pun.
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        if (!params.has("search")) return;
        params.delete("search");
        const qs = params.toString();
        router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    };

    return (
        <div className="flex flex-grow mx-0 md:mx-4">
            <div className="group flex w-full items-center rounded-full border border-gray-200 bg-white pl-4 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow focus-within:border-emerald-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-emerald-500/10">
                {/* Leading icon, jadi emerald saat input fokus */}
                <FaSearch
                    className="shrink-0 text-gray-400 transition-colors duration-200 group-focus-within:text-emerald-600"
                    size={15}
                />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("placeholder")}
                    className="w-full min-w-0 bg-transparent px-2.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    aria-label={t("inputLabel")}
                />

                {/* Clear, muncul halus saat ada teks */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-90 mr-1.5"
                        aria-label={t("clear")}
                    >
                        <FaTimes size={13} />
                    </button>
                )}

                {/* CTA submit, nempel di kanan, full height */}
                <button
                    type="button"
                    onClick={handleSearch}
                    className="shrink-0 self-stretch -my-px -mr-px flex items-center rounded-r-full bg-emerald-600 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300"
                    aria-label={t("search")}
                >
                    {t("search")}
                </button>
            </div>
        </div>
    );
}
