"use client"

import BrandCard from "@/components/card/BrandCard";
import BrandFilter from "./BrandFilter";
import { useEffect, useRef, useState } from "react";
import { useAllBrands } from "@/satelite/services/brandService";
import { Brand } from "@/types/brand/brand";
import ErrorComponent from "@/components/ui/feedback/Error";
import { BrandListSkeleton } from "@/components/skeletons/brand/BrandListSkeleton";
import { DataNotFound } from "@/components/ui/feedback/DataNotFound";
import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import LoadingSpinner from "@/components/ui/layout/LoadingSpinner";
import { SortOrder } from "@/enum/sortOrder";
import { useDebounce } from "@/satelite/hook/common/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryParamManager } from "@/satelite/hook/common/useQueryParamManager";
import { useTranslations } from "next-intl";

// Isi halaman daftar merek: grid semua brand (dengan filter huruf awal) untuk dijelajah.
export default function Brands() {
    const t = useTranslations("brands");
    const searchParams = useSearchParams();
    const initialBrand = searchParams.get("brand") || "";
    const router = useRouter();

    const sortOptions = [
        { label: t("sort.az"), value: SortOrder.ASC },
        { label: t("sort.za"), value: SortOrder.DESC },
    ];

    const [searchQuery, setSearchQuery] = useState(initialBrand);
    const debouncedSearch = useDebounce(searchQuery, 1000);

    const observerRef = useRef<HTMLDivElement | null>(null);

    const {
        value: sortOrder,
        setValue: setSortOrder,
    } = useQueryParamManager<SortOrder>({
        key: "sort",
        validValues: sortOptions.map((s) => s.value),
        initialValue: SortOrder.ASC,
        normalize: (v) => v as SortOrder,
    });

    const {
        data: brands,
        isPending,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useAllBrands({
        limit: 12,
        sortOrder: sortOrder,
        sortField: "name",
        search: debouncedSearch,
    });

    useEffect(() => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (debouncedSearch) {
            current.set("brand", debouncedSearch);
        } else {
            current.delete("brand");
        }

        router.replace(`?${current.toString()}`);
    }, [debouncedSearch, router, searchParams]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 }
        );

        const currentElement = observerRef.current;
        if (currentElement) observer.observe(currentElement);

        return () => {
            if (currentElement) observer.unobserve(currentElement);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [sortOrder, debouncedSearch]);

    if (isError) return <ErrorComponent />;

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="container w-full px-2 sm:px-4 pt-3 pb-5 mx-auto">
                <Breadcrumbs
                    items={[
                        { label: t("breadcrumb.dashboard"), href: "/" },
                        { label: t("breadcrumb.brands") }
                    ]}
                />
                {/* Header */}
                <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-green-800 mb-1 md:mb-2">{t("title")}</h2>
                        <p className="text-base md:text-lg text-gray-600">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <BrandFilter
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    sortOptions={sortOptions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Products */}
                {isPending ? (
                    <BrandListSkeleton />
                ) : brands?.pages[0]?.data?.data.length === 0 ? (
                    <div className="col-span-full">
                        <DataNotFound
                            title={t("notfound.title")}
                            description={t("notfound.description")}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 mb-9">
                        {brands?.pages.flatMap((page, pageIdx) =>
                            page.data.data.map((brand: Brand, idx: number) => (
                                <BrandCard key={`${brand.id}-${pageIdx}-${idx}`} brand={brand} isList={true} />
                            ))
                        )}
                    </div>
                )}

                <div ref={observerRef} className="h-10" />

                {isFetchingNextPage && (
                    <div className="flex justify-center">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
        </div>
    );
}