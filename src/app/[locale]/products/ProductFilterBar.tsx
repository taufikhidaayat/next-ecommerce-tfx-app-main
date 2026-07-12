"use client";

import { Brand } from "@/types/brand/brand";
import { Category } from "@/types/category/category";
import { SearchableFilterSelect } from "./SearchableFilterSelect";
import { SortOrder } from "@/enum/sortOrder";
import { useTranslations } from "next-intl";

type ProductFilterProps = {
    categories: Category[];
    category: string;
    onCategoryChange: (category: string) => void;

    brands: Brand[];
    brand: string;
    onBrandChange: (brand: string) => void;

    priceRanges: { value: string; label: string }[];
    priceRange: string;
    onPriceRangeChange: (priceRange: string) => void;

    sortOptions: { label: string; value: SortOrder }[];
    sortOrder: string;
    onSortChange: (sortVal: string) => void;
};

// Bilah filter katalog produk (versi desktop): pilihan kategori, brand, harga, urutan.
// Nilainya dikontrol halaman induk (Products) untuk memuat produk sesuai filter.
export default function ProductFilterBar({
    categories,
    category,
    onCategoryChange,
    brands,
    brand,
    onBrandChange,
    priceRanges,
    priceRange,
    onPriceRangeChange,
    sortOptions,
    sortOrder,
    onSortChange,
}: ProductFilterProps) {
    const t = useTranslations("products.filter");
    return (
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex flex-wrap gap-4">
                <SearchableFilterSelect
                    label={t("category")}
                    value={category}
                    options={categories.map((c) => ({ label: c.name, value: c.name.toLowerCase() }))}
                    onChange={onCategoryChange}
                />
                <SearchableFilterSelect
                    label={t("brand")}
                    value={brand}
                    options={brands.map((b) => ({ label: b.name, value: b.name.toLowerCase() }))}
                    onChange={onBrandChange}
                />
                <SearchableFilterSelect
                    label={t("priceRange.label")}
                    value={priceRange}
                    options={priceRanges}
                    onChange={onPriceRangeChange}
                    hideSearch
                />
            </div>

            <div className="ml-auto">
                <SearchableFilterSelect
                    label={t("sort.label")}
                    value={sortOrder}
                    options={sortOptions}
                    onChange={onSortChange}
                    hideAllOption
                    hideSearch
                />
            </div>
        </div>
    );
}