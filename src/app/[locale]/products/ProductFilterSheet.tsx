"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { FaTimes } from "react-icons/fa";
import { FiSearch, FiSliders, FiX, FiCheck } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import { Brand } from "@/types/brand/brand";
import { Category } from "@/types/category/category";
import { SortOrder } from "@/enum/sortOrder";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";

type ProductFilterSheetProps = {
    categories: Category[];
    category: string;

    brands: Brand[];
    brand: string;

    priceRanges: { value: string; label: string }[];
    priceRange: string;

    sortOptions: { label: string; value: SortOrder }[];
    sortOrder: string;

    /** Applies all filters in a single update, avoids racing URL writes. */
    onApply: (next: { category: string; brand: string; priceRange: string; sort: string }) => void;
};

type Pill = { label: string; value: string };

function PillGroup({
    options,
    value,
    onSelect,
}: {
    options: Pill[];
    value: string;
    onSelect: (val: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value || "all"}
                        type="button"
                        onClick={() => onSelect(opt.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${active
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                            }`}
                    >
                        {active && <FiCheck size={14} className="shrink-0" />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

// Versi filter katalog untuk HP: panel yang muncul dari bawah (bottom sheet) berisi
// filter yang sama dengan ProductFilterBar, agar nyaman di layar kecil.
export default function ProductFilterSheet({
    categories,
    category,
    brands,
    brand,
    priceRanges,
    priceRange,
    sortOptions,
    sortOrder,
    onApply,
}: ProductFilterSheetProps) {
    const t = useTranslations("products.filter");
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Staged values, applied only when the user taps "Terapkan".
    const [draftCategory, setDraftCategory] = useState(category);
    const [draftBrand, setDraftBrand] = useState(brand);
    const [draftPrice, setDraftPrice] = useState(priceRange);
    const [draftSort, setDraftSort] = useState(sortOrder);

    const [categoryQuery, setCategoryQuery] = useState("");
    const [brandQuery, setBrandQuery] = useState("");

    const { isMobile, sheetRef, bodyRef, sheetStyle, dragHandlers } = useBottomSheetDrag({
        isOpen: open,
        onClose: () => setOpen(false),
    });

    useEffect(() => setMounted(true), []);

    // Sync drafts to the live values each time the sheet opens.
    useEffect(() => {
        if (open) {
            setDraftCategory(category);
            setDraftBrand(brand);
            setDraftPrice(priceRange);
            setDraftSort(sortOrder);
            setCategoryQuery("");
            setBrandQuery("");
        }
    }, [open, category, brand, priceRange, sortOrder]);

    // Lock background scroll while the sheet is open.
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    const allLabel = t.raw("all");

    const categoryPills: Pill[] = useMemo(
        () => [
            { label: allLabel, value: "" },
            ...categories.map((c) => ({ label: c.name, value: c.name.toLowerCase() })),
        ],
        [categories, allLabel]
    );
    const brandPills: Pill[] = useMemo(
        () => [
            { label: allLabel, value: "" },
            ...brands.map((b) => ({ label: b.name, value: b.name.toLowerCase() })),
        ],
        [brands, allLabel]
    );
    const pricePills: Pill[] = [{ label: allLabel, value: "" }, ...priceRanges];

    const filteredCategoryPills = useMemo(
        () => categoryPills.filter((p) => p.value === "" || p.label.toLowerCase().includes(categoryQuery.toLowerCase())),
        [categoryPills, categoryQuery]
    );
    const filteredBrandPills = useMemo(
        () => brandPills.filter((p) => p.value === "" || p.label.toLowerCase().includes(brandQuery.toLowerCase())),
        [brandPills, brandQuery]
    );

    // Count active filters (sort is ordering, not counted) for the trigger badge.
    const activeCount = (category ? 1 : 0) + (brand ? 1 : 0) + (priceRange ? 1 : 0);

    const handleApply = () => {
        onApply({
            category: draftCategory,
            brand: draftBrand,
            priceRange: draftPrice,
            sort: draftSort,
        });
        setOpen(false);
    };

    const handleReset = () => {
        setDraftCategory("");
        setDraftBrand("");
        setDraftPrice("");
        setDraftSort(sortOptions[0]?.value ?? draftSort);
    };

    return (
        <>
            {/* Trigger, mobile only; desktop keeps the inline filter bar. */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-green-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
            >
                <span className="flex items-center gap-2">
                    <FiSliders size={16} className="text-emerald-600" />
                    {t("filterButton")}
                </span>
                <span className="flex items-center gap-2">
                    {activeCount > 0 && (
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                    <IoIosArrowForward size={16} className="text-gray-400" />
                </span>
            </button>

            {mounted && open && isMobile &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-backdrop-in"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setOpen(false);
                        }}
                    >
                        <div
                            ref={sheetRef}
                            style={sheetStyle}
                            className="flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-gray-50 shadow-2xl"
                        >
                            {/* Grab zone */}
                            <div className="shrink-0 touch-none select-none" {...dragHandlers}>
                                <div className="flex justify-center bg-white pt-3 pb-2">
                                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                                </div>
                                <div className="relative flex items-center justify-center border-b border-gray-100 bg-white px-5 pb-4 pt-1">
                                    <h2 className="text-lg font-bold tracking-wide text-green-700">{t("sheetTitle")}</h2>
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                        aria-label="Close"
                                    >
                                        <FaTimes size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable body */}
                            <div ref={bodyRef} className="flex-1 min-h-0 space-y-6 overflow-y-auto overscroll-y-contain px-4 py-5">
                                {/* Sort */}
                                <section>
                                    <h3 className="mb-2.5 text-sm font-bold text-gray-800">{t("sort.label")}</h3>
                                    <PillGroup options={sortOptions} value={draftSort} onSelect={setDraftSort} />
                                </section>

                                {/* Price range */}
                                <section>
                                    <h3 className="mb-2.5 text-sm font-bold text-gray-800">{t("priceRange.label")}</h3>
                                    <PillGroup options={pricePills} value={draftPrice} onSelect={setDraftPrice} />
                                </section>

                                {/* Category */}
                                <section>
                                    <h3 className="mb-2.5 text-sm font-bold text-gray-800">{t("category")}</h3>
                                    {categories.length > 8 && (
                                        <div className="relative mb-3">
                                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                value={categoryQuery}
                                                onChange={(e) => setCategoryQuery(e.target.value)}
                                                placeholder={t("searchInDropdown")}
                                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                            {categoryQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCategoryQuery("")}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {filteredCategoryPills.length > 1 ? (
                                        <PillGroup options={filteredCategoryPills} value={draftCategory} onSelect={setDraftCategory} />
                                    ) : (
                                        <p className="py-2 text-sm text-gray-400">{t("noResults")}</p>
                                    )}
                                </section>

                                {/* Brand */}
                                <section>
                                    <h3 className="mb-2.5 text-sm font-bold text-gray-800">{t("brand")}</h3>
                                    {brands.length > 8 && (
                                        <div className="relative mb-3">
                                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                value={brandQuery}
                                                onChange={(e) => setBrandQuery(e.target.value)}
                                                placeholder={t("searchInDropdown")}
                                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                            {brandQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setBrandQuery("")}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {filteredBrandPills.length > 1 ? (
                                        <PillGroup options={filteredBrandPills} value={draftBrand} onSelect={setDraftBrand} />
                                    ) : (
                                        <p className="py-2 text-sm text-gray-400">{t("noResults")}</p>
                                    )}
                                </section>
                            </div>

                            {/* Footer actions */}
                            <div className="shrink-0 flex gap-3 border-t border-gray-100 bg-white px-4 py-3">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                    {t("reset")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    className="flex-[1.4] rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                                >
                                    {t("apply")}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
