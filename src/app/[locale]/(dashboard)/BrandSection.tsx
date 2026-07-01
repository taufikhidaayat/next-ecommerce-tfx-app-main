"use client";

import BrandCard from "@/components/card/BrandCard";
import { BrandListSkeleton } from "@/components/skeletons/brand/BrandListSkeleton";
import { useBrands } from "@/satelite/services/brandService";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";

export default function BrandSection() {
    const t = useTranslations("home.brands");
    const { data: brands, isPending } = useBrands({
        page: 1,
        limit: 12,
    });

    return (
        <section className="w-full px-2 sm:px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div>
                        <h2 className="text-xl sm:text-3xl font-extrabold text-green-800 mb-1 sm:mb-2 relative inline-block">
                            {t("title")}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">{t("subtitle")}</p>
                    </div>
                    <Link href="/brands">
                        <button className="border border-green-800 text-green-800 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 mt-2 sm:mt-0 text-sm sm:text-base font-medium">
                            {t("viewAll")}
                        </button>
                    </Link>
                </div>

                {/* Brands Grid */}
                {isPending ? (
                    <BrandListSkeleton />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-6">
                        {brands?.data?.data?.slice(0, 12).map((brand, idx) => (
                            <BrandCard key={idx} brand={brand} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
