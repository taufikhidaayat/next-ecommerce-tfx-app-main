"use client";

import ProductCard from "@/components/card/ProductCard";
import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import { useAllProducts } from "@/satelite/services/productService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeQueryParam } from "@/utils/sanitizeQueryParam";
import { Product } from "@/types/product/product";
import { useCategories } from "@/satelite/services/categoryService";
import { useBrands } from "@/satelite/services/brandService";
import ProductFilterSkeleton from "@/components/skeletons/product/ProductFilterSkeleton";
import { ProductListSkeleton } from "@/components/skeletons/product/ProductListSkeleton";
import { ProductCardSkeleton } from "@/components/skeletons/product/ProductCardSkeleton";
import { DataNotFound } from "@/components/ui/feedback/DataNotFound";
import ProductFilterBar from "./ProductFilterBar";
import ProductFilterSheet from "./ProductFilterSheet";
import ErrorComponent from "@/components/ui/feedback/Error";
import { SortOrder } from "@/enum/sortOrder";
import { useQueryParamManager } from "@/satelite/hook/common/useQueryParamManager";
import { useTranslations } from "next-intl";
import { IoClose } from "react-icons/io5";
import { GrSearchAdvanced } from "react-icons/gr";

const priceRanges = [
    { label: "", value: "under-10000" },
    { label: "", value: "10000-50000" },
    { label: "", value: "50000-100000" },
    { label: "", value: "above-100000" },
];

const sortOptions: { label: string; value: SortOrder }[] = [
    { label: "", value: SortOrder.DESC }, // "DESC"
    { label: "", value: SortOrder.ASC }   // "ASC"
];

// Kategori eksklusif yang otomatis dipasangkan dengan brand-nya. Saat kategori
// (key, lowercase) dipilih, brand (value, lowercase) ikut di-set di filter; saat
// pindah ke kategori lain, brand pasangan ini ikut dibersihkan.
const EXCLUSIVE_CATEGORY_BRAND: Record<string, string> = {
    "galeri maduku": "galeri maduku",
};
// Peta balik brand → kategori, plus himpunan untuk cek cepat.
const BRAND_TO_CATEGORY: Record<string, string> = Object.fromEntries(
    Object.entries(EXCLUSIVE_CATEGORY_BRAND).map(([cat, br]) => [br, cat])
);
const PAIRED_BRANDS = new Set(Object.values(EXCLUSIVE_CATEGORY_BRAND));
const PAIRED_CATEGORIES = new Set(Object.keys(EXCLUSIVE_CATEGORY_BRAND));

export default function Products() {
    const t = useTranslations("products.page");
    const filterT = useTranslations("products.filter");
    const observerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Berapa banyak kartu "Produk Serupa" yang ditampilkan. Mulai 2 baris (10 kartu,
    // 5 per baris di desktop) lalu bertambah 10 tiap kali scroll mencapai bawah.
    const SIMILAR_STEP = 10;
    const [similarVisible, setSimilarVisible] = useState(SIMILAR_STEP);

    // Jumlah kolom grid mengikuti breakpoint Tailwind (default 2, md 3, lg 5).
    // Dipakai untuk menahan sisa produk yang belum genap 1 baris saat masih ada
    // halaman berikutnya → produk selalu tampil dalam baris penuh.
    const [cols, setCols] = useState(5);
    useEffect(() => {
        const computeCols = () => {
            const w = window.innerWidth;
            setCols(w >= 1024 ? 5 : w >= 768 ? 3 : 2);
        };
        computeCols();
        window.addEventListener("resize", computeCols);
        return () => window.removeEventListener("resize", computeCols);
    }, []);

    // Apply several filters at once in a SINGLE URL update. Calling each
    // useQueryParamManager.setValue separately would race — they each build the
    // URL from the same stale snapshot, so only the last write survives.
    const applyFilters = useCallback(
        (next: { category: string; brand: string; priceRange: string; sort: string }) => {
            const params = new URLSearchParams(searchParams.toString());
            const setOrDelete = (k: string, v: string) => {
                if (v) params.set(k, sanitizeQueryParam(v));
                else params.delete(k);
            };
            setOrDelete("category", next.category);
            setOrDelete("brand", next.brand);
            setOrDelete("priceRange", next.priceRange);
            setOrDelete("sort", next.sort);
            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    const { data: categories, isPending: isPendingCategories } = useCategories({
        page: 1,
        limit: 100,
    });

    const { data: brands, isPending: isPendingBrands } = useBrands({
        page: 1,
        limit: 100,
    });

    const categoryList = useMemo(
        () => categories?.data?.data.map((c) => c.name.toLowerCase()) ?? [],
        [categories]
    );

    const {
        value: category,
        setValue: setCategory,
    } = useQueryParamManager({
        key: "category",
        validValues: categoryList,
        initialValue: "",
        isReady: !isPendingCategories && !!categories?.data?.data,
    });

    // Brand is intentionally NOT validated against the loaded brand list.
    // The list is capped (limit: 100) while there are more brands than that, so
    // validating here would silently strip the param for any brand beyond the
    // cap — the filter would vanish on click. Let the backend (case-insensitive
    // name match) decide whether the brand yields results instead.
    const {
        value: brand,
        setValue: setBrand,
    } = useQueryParamManager({
        key: "brand",
        initialValue: "",
    });

    // The brand dropdown is fed from the loaded (capped) brand list. If the active
    // brand came from a link/URL but isn't in that page, surface it as an option so
    // the dropdown shows it as selected instead of falsely reading "All Brand".
    const filterBrands = useMemo(() => {
        const loaded = brands?.data?.data ?? [];
        if (!brand) return loaded;
        const exists = loaded.some((b) => b.name.toLowerCase() === brand.toLowerCase());
        if (exists) return loaded;
        const label = brand.replace(/\b\w/g, (c) => c.toUpperCase());
        return [...loaded, { name: label, description: "" }];
    }, [brands, brand]);

    const {
        value: priceRange,
        setValue: setPriceRange,
    } = useQueryParamManager({
        key: "priceRange",
        validValues: priceRanges.map((p) => p.value),
        initialValue: "",
    });

    const {
        value: sortOrder,
        setValue: setSortOrder,
    } = useQueryParamManager<SortOrder>({
        key: "sort",
        validValues: sortOptions.map((s) => s.value),
        initialValue: SortOrder.DESC,
        normalize: (v) => v as SortOrder,
    });

    const {
        value: search,
        setValue: setSearch,
    } = useQueryParamManager({
        key: "search",
        initialValue: "",
    });

    // Lengkapi pasangan eksklusif saat datang dari URL/link yang hanya membawa
    // salah satu sisi (mis. kartu storefront `?category=galeri maduku`, atau link
    // `?brand=galeri maduku`). Add-only & dua arah; kategori menang bila tak
    // konsisten. Perubahan dari interaksi pengguna (termasuk membersihkan pasangan)
    // ditangani handler di bawah secara atomik.
    useEffect(() => {
        if (isPendingCategories) return;
        const pairedBrand = EXCLUSIVE_CATEGORY_BRAND[category.toLowerCase()];
        if (pairedBrand) {
            if (brand.toLowerCase() !== pairedBrand) setBrand(pairedBrand);
            return;
        }
        const pairedCategory = BRAND_TO_CATEGORY[brand.toLowerCase()];
        if (pairedCategory && category.toLowerCase() !== pairedCategory) {
            setCategory(pairedCategory);
        }
    }, [category, brand, isPendingCategories, setBrand, setCategory]);

    // Ganti kategori: kalau kategori eksklusif → pasang brand-nya; kalau pindah
    // dari kategori eksklusif → bersihkan brand pasangannya. Satu update URL.
    const handleCategoryChange = useCallback(
        (nextCategory: string) => {
            const pairedBrand = EXCLUSIVE_CATEGORY_BRAND[nextCategory.toLowerCase()];
            let nextBrand = brand;
            if (pairedBrand) nextBrand = pairedBrand;
            else if (PAIRED_BRANDS.has(brand.toLowerCase())) nextBrand = "";
            applyFilters({ category: nextCategory, brand: nextBrand, priceRange, sort: sortOrder });
        },
        [applyFilters, brand, priceRange, sortOrder]
    );

    // Ganti brand: simetris — brand eksklusif → pasang kategorinya; pindah dari
    // brand eksklusif → bersihkan kategori pasangannya.
    const handleBrandChange = useCallback(
        (nextBrand: string) => {
            const pairedCategory = BRAND_TO_CATEGORY[nextBrand.toLowerCase()];
            let nextCategory = category;
            if (pairedCategory) nextCategory = pairedCategory;
            else if (PAIRED_CATEGORIES.has(category.toLowerCase())) nextCategory = "";
            applyFilters({ category: nextCategory, brand: nextBrand, priceRange, sort: sortOrder });
        },
        [applyFilters, category, priceRange, sortOrder]
    );

    // Versi pairing untuk bottom-sheet mobile (set semua filter sekaligus).
    const applyFiltersWithPair = useCallback(
        (next: { category: string; brand: string; priceRange: string; sort: string }) => {
            let { category: c, brand: b } = next;
            const pairedBrand = EXCLUSIVE_CATEGORY_BRAND[c.toLowerCase()];
            const pairedCategory = BRAND_TO_CATEGORY[b.toLowerCase()];
            if (pairedBrand) b = pairedBrand;            // kategori eksklusif menang
            else if (pairedCategory) c = pairedCategory; // brand eksklusif memasang kategori
            else {
                if (PAIRED_BRANDS.has(b.toLowerCase())) b = "";
                if (PAIRED_CATEGORIES.has(c.toLowerCase())) c = "";
            }
            applyFilters({ ...next, category: c, brand: b });
        },
        [applyFilters]
    );

    const {
        data: products,
        isPending,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useAllProducts({
        limit: 10,
        sortOrder,
        category,
        priceRange,
        brand,
        search,
    });

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [sortOrder, category, priceRange, brand]);

    // Saat pencarian/filter berubah, kembalikan tampilan "Produk Serupa" ke 2 baris.
    useEffect(() => {
        setSimilarVisible(SIMILAR_STEP);
    }, [search, sortOrder, category, priceRange, brand]);

    // Total hasil (semua halaman, bukan cuma yang sudah dimuat) untuk teks "Menampilkan N ...".
    const totalItems = products?.pages?.[0]?.data?.meta?.totalItems;

    // Semua produk yang sudah dimuat (gabungan semua halaman infinite-scroll).
    const loadedProducts = useMemo(
        () => products?.pages.flatMap((page) => page.data.data as Product[]) ?? [],
        [products]
    );

    // Token pencarian (samakan dgn backend: pisah non-alfanumerik, min 2 huruf).
    const searchTokens = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];
        return [...new Set(q.split(/[^a-z0-9]+/i).filter((tok) => tok.length >= 2))];
    }, [search]);

    // Pisahkan hasil: "paling sesuai" = nama produk mengandung kata pencarian
    // (selaras tier "name contains" di backend). Sisanya (cocok via fuzzy/kategori/
    // brand, mis. cari "fullo" tapi muncul "dancow") → "Produk Serupa".
    const { relevantProducts, similarProducts } = useMemo(() => {
        if (searchTokens.length === 0) {
            return { relevantProducts: loadedProducts, similarProducts: [] as Product[] };
        }
        const relevant: Product[] = [];
        const similar: Product[] = [];
        for (const p of loadedProducts) {
            const name = (p.name ?? "").toLowerCase();
            (searchTokens.some((tok) => name.includes(tok)) ? relevant : similar).push(p);
        }
        return { relevantProducts: relevant, similarProducts: similar };
    }, [loadedProducts, searchTokens]);

    const isSearching = searchTokens.length > 0;

    // Hanya tampilkan sebagian "Produk Serupa" (kelipatan 2 baris). Sisanya muncul
    // saat scroll. Saat tidak mencari, bagian ini kosong jadi tidak berpengaruh.
    const visibleSimilar = useMemo(
        () => similarProducts.slice(0, similarVisible),
        [similarProducts, similarVisible]
    );

    // Potong daftar ke kelipatan jumlah kolom agar baris terakhir selalu penuh.
    // Sisa yang belum genap 1 baris (termasuk saat baru < 1 baris) DITAHAN selama
    // masih ada halaman berikutnya — diganti skeleton, lalu muncul saat data cukup.
    // Saat sudah halaman terakhir (tidak ada lagi data), tampilkan apa adanya.
    const toFullRows = useCallback(
        (list: Product[]) => {
            if (!hasNextPage) return list;
            const remainder = list.length % cols;
            return remainder === 0 ? list : list.slice(0, list.length - remainder);
        },
        [hasNextPage, cols]
    );

    const displayRelevant = useMemo(() => toFullRows(relevantProducts), [toFullRows, relevantProducts]);
    const displaySimilar = useMemo(() => toFullRows(visibleSimilar), [toFullRows, visibleSimilar]);

    // Lengkapi buffer agar "Produk Serupa" bisa langsung tampil 2 baris penuh:
    // muat halaman berikutnya selama buffer similar masih kurang dari yang dibutuhkan.
    useEffect(() => {
        if (
            isSearching &&
            hasNextPage &&
            !isFetchingNextPage &&
            similarProducts.length > 0 &&
            similarProducts.length < similarVisible
        ) {
            fetchNextPage();
        }
    }, [isSearching, hasNextPage, isFetchingNextPage, similarProducts.length, similarVisible, fetchNextPage]);

    // Infinite scroll: di bawah halaman, ungkap 2 baris similar berikutnya (bila
    // sudah ada di buffer) sambil tetap memuat data baru untuk kedua daftar.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (!first.isIntersecting || isFetchingNextPage) return;
                if (isSearching && similarProducts.length > similarVisible) {
                    setSimilarVisible((n) => n + SIMILAR_STEP);
                }
                if (hasNextPage) fetchNextPage();
            },
            // Prefetch ~600px sebelum sentinel benar-benar terlihat → mengurangi jank.
            { threshold: 0, rootMargin: "600px 0px" }
        );

        const currentElement = observerRef.current;
        if (currentElement) observer.observe(currentElement);

        return () => {
            if (currentElement) observer.unobserve(currentElement);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSearching, similarProducts.length, similarVisible]);

    // Grid rata-kiri (standar): item mengalir dari kiri; baris terakhir yang belum
    // penuh menyisakan ruang di kanan dan akan terisi saat scroll memuat lebih banyak.
    const gridClass =
        "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6";

    if (isError) return <ErrorComponent />;

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="container w-full px-2 sm:px-4 pt-3 pb-5 mx-auto">
                <Breadcrumbs
                    items={[
                        { label: t("breadcrumb.dashboard"), href: "/" },
                        { label: t("breadcrumb.products") }
                    ]}
                />

                <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-green-800 mb-2">{t("title")}</h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>

                {isPendingCategories || isPendingBrands ? (
                    <ProductFilterSkeleton />
                ) : (
                    (() => {
                        const localizedPriceRanges = priceRanges.map(pr => ({
                            ...pr,
                            label: filterT.raw(`priceRange.${pr.value}`)
                        }));
                        const localizedSortOptions = sortOptions.map(so => ({
                            ...so,
                            label: filterT.raw(`sort.${so.value.toUpperCase()}`)
                        }));
                        return (
                            <>
                                {/* Mobile: single Filter button → bottom sheet */}
                                <div className="sm:hidden mb-6">
                                    <ProductFilterSheet
                                        categories={categories?.data.data || []}
                                        brands={filterBrands}
                                        priceRanges={localizedPriceRanges}
                                        sortOptions={localizedSortOptions}
                                        sortOrder={sortOrder}
                                        category={category}
                                        brand={brand}
                                        priceRange={priceRange}
                                        onApply={applyFiltersWithPair}
                                    />
                                </div>

                                {/* Desktop: inline filter bar */}
                                <div className="hidden sm:block">
                                    <ProductFilterBar
                                        categories={categories?.data.data || []}
                                        brands={filterBrands}
                                        priceRanges={localizedPriceRanges}
                                        sortOptions={localizedSortOptions}
                                        sortOrder={sortOrder}
                                        category={category}
                                        brand={brand}
                                        priceRange={priceRange}
                                        onCategoryChange={handleCategoryChange}
                                        onBrandChange={handleBrandChange}
                                        onPriceRangeChange={setPriceRange}
                                        onSortChange={(v) => setSortOrder(v as SortOrder)}
                                    />
                                </div>
                            </>
                        );
                    })()
                )}

                {search && (
                    <div className="my-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 shadow-[0_6px_24px_-10px_rgba(22,163,74,0.45)] sm:px-5 sm:py-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3 sm:items-center">
                                <span className="mt-0.5 shrink-0 text-green-600 sm:mt-0">
                                    <GrSearchAdvanced className="h-5 w-5 sm:h-6 sm:w-6" />
                                </span>
                                <p className="min-w-0 break-words text-sm text-gray-700 sm:text-base">
                                    {t("searching")}{" "}
                                    <span className="font-bold text-green-800">“{search}”</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSearch("")}
                                className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:border-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                <IoClose className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">{t("clearSearch")}</span>
                            </button>
                        </div>
                    </div>
                )}

                {!isPending && (
                    isSearching ? (
                        relevantProducts.length > 0 && (
                            <p className="mb-3 sm:mb-4 text-sm text-gray-500">
                                {t("resultCountSearch", { count: relevantProducts.length })}
                            </p>
                        )
                    ) : (
                        typeof totalItems === "number" && totalItems > 0 && (
                            <p className="mb-3 sm:mb-4 text-sm text-gray-500">
                                {t("resultCount", { count: totalItems })}
                            </p>
                        )
                    )
                )}

                {isPending ? (
                    <ProductListSkeleton />
                ) : loadedProducts.length === 0 ? (
                    <DataNotFound
                        title={t("notfound.title")}
                        description={t("notfound.description")}
                    />
                ) : (
                    <>
                        {/* Hasil paling sesuai (atau semua produk saat tidak mencari).
                            displayRelevant = dipotong ke baris penuh (sisa ditahan sampai
                            halaman berikut termuat) → tidak ada slot kosong di kanan. */}
                        {relevantProducts.length > 0 && (
                            <div className={gridClass}>
                                {displayRelevant.map((product, idx) => (
                                    <ProductCard key={`relevant-${product.id}-${idx}`} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Produk serupa — hasil yang kurang sesuai (fuzzy/kategori/brand) */}
                        {isSearching && similarProducts.length > 0 && (
                            <>
                                <div className={relevantProducts.length > 0 ? "mt-8 mb-3 sm:mt-10 sm:mb-4" : "mb-3 sm:mb-4"}>
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:h-6" />
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                            {t("similarHeading")}
                                        </h3>
                                    </div>
                                    <p className="mt-1 pl-4 text-xs sm:text-sm text-gray-500">
                                        {t("similarSubtitle")}
                                    </p>
                                </div>
                                <div className={gridClass}>
                                    {displaySimilar.map((product, idx) => (
                                        <ProductCard key={`similar-${product.id}-${idx}`} product={product} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Skeleton halaman berikutnya — selalu di baris sendiri (1 baris
                            penuh sesuai jumlah kolom), tidak menyempil di antara produk. */}
                        {isFetchingNextPage && (
                            <div className={`${gridClass} mt-3 sm:mt-6`}>
                                {Array.from({ length: cols }).map((_, i) => (
                                    <ProductCardSkeleton key={`next-skel-${i}`} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Sentinel diberi rootMargin besar (lihat observer) → prefetch jauh
                    sebelum mentok bawah, jadi kartu sudah siap saat terlihat. */}
                <div ref={observerRef} className="h-10" />
            </div>
        </div>
    );
}