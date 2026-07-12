"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { useFrequentlyBoughtTogether } from "@/satelite/services/productService";
import { useAuth } from "@/satelite/services/authService";
import { addCart } from "@/satelite/hook/cart/useAddCart";
import { formatCurrency } from "@/utils/formatCurrency";
import { DEFAULT_PRODUCT_URL } from "@/lib/constant";

// Bagian "Sering Dibeli Bersama" di halaman detail produk: menampilkan produk yang
// biasanya dibeli bareng produk ini (datanya dari analisis pembelian di backend).
export default function FrequentlyBoughtTogether({ productId }: { productId: string }) {
    const t = useTranslations("products");
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: user } = useAuth();
    const { data, isLoading } = useFrequentlyBoughtTogether(productId);
    const [isAdding, setIsAdding] = useState(false);

    const products = data?.data ?? [];

    if (!isLoading && products.length === 0) return null;

    const handleAddAll = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (products.length === 0) return;

        setIsAdding(true);
        try {
            await Promise.all(
                products.map((p) =>
                    addCart({ productId: p.id, quantity: 1, priceType: "retail" })
                )
            );
            toast.success(t("addAllSuccess", { count: products.length }));
            queryClient.invalidateQueries({ queryKey: ["carts"] });
        } catch {
            toast.error(t("button.addCartFail"));
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <section className="mt-8 sm:mt-10">
            <div className="mb-5 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="h-5 w-1.5 rounded-full bg-emerald-500" />
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                        {t("frequentlyBoughtTogether")}
                    </h2>
                </div>

                {!isLoading && products.length > 0 && (
                    <button
                        type="button"
                        onClick={handleAddAll}
                        disabled={isAdding}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                    >
                        {isAdding ? (
                            <FaSpinner className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                        ) : (
                            <RiShoppingBasket2Fill className="relative -top-px h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                        <span>{isAdding ? t("button.adding") : t("addAllToCart")}</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-2">
                            <div className="aspect-square w-full rounded-lg bg-gray-100" />
                            <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
                            <div className="mt-1.5 h-3.5 w-1/2 rounded bg-gray-100" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
                    {products.map((p) => {
                        const discount = p.discountPercentage ?? 0;
                        const hasDiscount = discount > 0;
                        const finalPrice = hasDiscount
                            ? p.price - (p.price * discount) / 100
                            : p.price;

                        return (
                            <Link
                                key={p.id}
                                href={`/products/${p.id}`}
                                className="group block h-full"
                            >
                                {/* Lift dipindah ke wrapper dalam via group-hover; <Link> (area hover)
                                    tetap diam supaya tidak ada jitter saat kursor di tepi card. */}
                                <div className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-2 shadow-sm transition duration-300 ease-out will-change-transform group-hover:-translate-y-1.5 group-hover:border-emerald-300 group-hover:bg-emerald-50/40 group-hover:shadow-lg group-hover:shadow-emerald-100/60">
                                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
                                        <Image
                                            src={p.imageUrl || DEFAULT_PRODUCT_URL}
                                            alt={p.name}
                                            fill
                                            sizes="(max-width: 640px) 30vw, 140px"
                                            className="object-contain p-1.5"
                                        />
                                        {hasDiscount && (
                                            <span className="absolute left-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                                                {Math.floor(discount)}%
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-tight text-gray-800 transition-colors group-hover:text-emerald-700 sm:text-xs">
                                        {p.name}
                                    </h3>

                                    <div className="mt-1 flex flex-wrap items-baseline gap-x-1">
                                        <span className="text-xs font-bold text-emerald-700 sm:text-sm">
                                            {formatCurrency(finalPrice)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-[10px] text-gray-400 line-through">
                                                {formatCurrency(p.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
