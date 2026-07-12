"use client";

import HighlightMatch from "@/utils/highlightMatch";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type SearchModalProps = {
    isOpen: boolean;
    onClose: () => void;
    q: string;
    isPending: boolean;
    data: {
        brands: string[];
        categories: string[];
        products: string[];
    };
    searchBoxRef: React.RefObject<HTMLDivElement | null>;
};

// Kotak/panel pencarian toko: user mengetik → menampilkan saran hasil (produk/brand/
// kategori) secara langsung (dengan debounce). Memakai searchService.
export default function SearchModalBox({
    isOpen,
    onClose,
    q,
    isPending,
    data,
    searchBoxRef
}: SearchModalProps) {
    const router = useRouter();
    const t = useTranslations("searchModal");

    const [mounted, setMounted] = useState(false);
    const noResult =
        data.products.length === 0 &&
        data.brands.length === 0 &&
        data.categories.length === 0;

    const handleSearch = (type: string, item: string) => {
        if (!item.trim()) return;

        let path = "";

        switch (type) {
            case "product":
                path = `/products?search=${encodeURIComponent(item.trim().toLowerCase())}`;
                break;
            case "brand":
                path = `/products?brand=${encodeURIComponent(item.trim().toLowerCase())}`;
                break;
            case "category":
                path = `/products?category=${encodeURIComponent(item.trim().toLowerCase())}`;
                break;
        }

        if (path) {
            router.push(path);
            onClose();
        }
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Skip if this instance's container is CSS-hidden (e.g. the mobile
            // dropdown on desktop, or desktop dropdown on mobile) so only the
            // visible instance closes the dropdown.
            if (searchBoxRef.current?.offsetParent === null) return;

            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, searchBoxRef]);

    if (!mounted || !isOpen || isPending || noResult) return null;

    return (
        <div className="absolute w-full sm:w-11/12 left-0 sm:left-4 sm:right-4 top-full bg-white shadow-2xl rounded-2xl mt-2 sm:mt-3 z-50 border border-gray-100 animate-[fadeIn_0.18s_ease]">
            <div className="max-h-64 sm:max-h-80 overflow-y-auto p-2 sm:p-4">
                {data.products.length > 0 && (
                    <div className="mb-4 sm:mb-5">
                        <h4 className="text-xs font-bold text-gray-400 px-2 sm:px-3 mb-1 sm:mb-2 uppercase tracking-wider">
                            {t("products")}
                        </h4>
                        <ul className="flex flex-col gap-1 sm:gap-2">
                            {data.products.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer rounded-lg text-sm sm:text-base"
                                    onClick={() => handleSearch("product", item)}
                                >
                                    <HighlightMatch text={item} query={q} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {data.brands.length > 0 && (
                    <div className="mb-4 sm:mb-5">
                        <h4 className="text-xs font-bold text-gray-400 px-2 sm:px-3 mb-1 sm:mb-2 uppercase tracking-wider">
                            {t("brands")}
                        </h4>
                        <ul className="flex flex-col gap-1 sm:gap-2">
                            {data.brands.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer rounded-lg text-sm sm:text-base"
                                    onClick={() => handleSearch("brand", item)}
                                >
                                    <HighlightMatch text={item} query={q} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {data.categories.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 px-2 sm:px-3 mb-1 sm:mb-2 uppercase tracking-wider">
                            {t("categories")}
                        </h4>
                        <ul className="flex flex-col gap-1 sm:gap-2">
                            {data.categories.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer rounded-lg text-sm sm:text-base"
                                    onClick={() => handleSearch("category", item)}
                                >
                                    <HighlightMatch text={item} query={q} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}