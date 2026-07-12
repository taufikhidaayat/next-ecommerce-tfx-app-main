"use client";

import ProductCard from "@/components/card/ProductCard";
import { ProductListSkeleton } from "@/components/skeletons/product/ProductListSkeleton";
import { useRecommendedProducts } from "@/satelite/services/productService";
import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";

// Bagian "Produk" di beranda: menampilkan produk rekomendasi untuk pengunjung.
export default function ProductSection() {
    const t = useTranslations("home.products");
    // Rekomendasi content-based: personal (berdasarkan produk yang dibuka) bila login,
    // produk populer bila tamu/belum ada riwayat.
    const { data: recommendations, isPending } = useRecommendedProducts(10);

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
                    <Link href="/products">
                        <button className="border border-green-800 text-green-800 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 mt-2 sm:mt-0 text-sm sm:text-base font-medium">
                            {t("viewAll")}
                        </button>
                    </Link>
                </div>

                {isPending ? (
                    <ProductListSkeleton />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6">
                        {recommendations?.data.map((product, idx) => (
                            <ProductCard key={idx} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
