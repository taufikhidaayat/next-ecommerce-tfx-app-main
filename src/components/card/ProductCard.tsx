'use client';

import { Product } from "@/types/product/product";
import { formatRating } from "@/utils/formatRating";
import { DEFAULT_PRODUCT_URL } from "@/lib/constant";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiFillStar } from "react-icons/ai";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { useTranslations } from "next-intl";
import { addCart } from "@/satelite/hook/cart/useAddCart";
import { useAuth } from "@/satelite/services/authService";
import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

type ProductCardProps = {
    product: Product;
};

const getDiscountedPrice = (price: number, discount: number) =>
    Math.max(0, price - price * discount / 100);

export default function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations("products");
    const router = useRouter();
    const { data: user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [imageError, setImageError] = useState(false);
    const queryClient = useQueryClient();
    // Diskon harga normal (retail) — menentukan harga yang ditampilkan & coretannya.
    const normalDiscount = product.discountPercentage ?? 0;
    const hasRetailDiscount = normalDiscount > 0;
    const discountedPrice = hasRetailDiscount
        ? getDiscountedPrice(product.price, normalDiscount)
        : product.price;

    // Diskon grosir efektif terhadap harga normal (kalau grosir aktif & lebih murah).
    const bulkEnabled = product.bulkDiscountEnabled !== false && (product.bulkDiscountPrice ?? 0) > 0;
    const bulkDiscount =
        bulkEnabled && product.price > 0 && (product.bulkDiscountPrice ?? 0) < product.price
            ? Math.floor(((product.price - (product.bulkDiscountPrice ?? 0)) / product.price) * 100)
            : 0;

    // Badge menampilkan diskon TERBESAR (normal vs grosir); muncul jika salah satu ada.
    const badgeDiscount = Math.max(normalDiscount, bulkDiscount);
    const hasBadge = badgeDiscount > 0;
    const imageUrl = (!imageError && product.imageUrl) ? product.imageUrl : DEFAULT_PRODUCT_URL;
    const isOutOfStock = (product.stock ?? 0) <= 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/login");
            return;
        }

        if (isOutOfStock) {
            toast.error(t("detail.outOfStock"));
            return;
        }

        if (isAdding) return;
        setIsAdding(true);

        try {
            await addCart({
                productId: product.id!,
                quantity: 1,
                priceType: 'retail',
            });
            toast.success(t("button.addCartSuccess"));
            queryClient.invalidateQueries({ queryKey: ['carts'] });
        } catch {
            toast.error(t("button.addCartFail"));
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Link href={`/products/${product.id}`} passHref>
            <div className="group block h-full cursor-pointer">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 h-full flex flex-col will-change-transform">
                <div className="relative">
                    {/* Product Image */}
                    <div className="relative w-full h-40 sm:h-44 flex items-center justify-center bg-white p-2 sm:p-4 overflow-hidden">
                        <Image
                            src={imageUrl}
                            alt={`Gambar ${product.name}`}
                            width={300}
                            height={300}
                            className={`w-auto h-full object-contain transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
                            onError={() => setImageError(true)}
                        />
                        {isOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-gray-800/80 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {t("detail.outOfStock")}
                                </span>
                            </span>
                        )}
                    </div>

                    {/* Diskon — kanan atas (terbesar antara normal & grosir) */}
                    {hasBadge && (
                        <div className="absolute top-0 right-0">
                            <span className="bg-red-500 text-white text-[11px] sm:text-sm font-bold px-2 py-0.5 rounded-bl-md rounded-tr-xl block">
                                {badgeDiscount}%
                            </span>
                        </div>
                    )}
                    {/* Kategori — kiri bawah (menempel di bawah area gambar) */}
                    {product.categoryName && (
                        <span className="absolute bottom-0 left-0">
                            <span className="bg-[#FDBA12] text-gray-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-tr-md block">
                                {product.categoryName}
                            </span>
                        </span>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                    {/* Brand & Name */}
                    <div className="mb-1.5 sm:mb-2">
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">
                            {product.brandName || "-"}
                        </p>
                        <h3 className="font-medium text-xs sm:text-sm text-emerald-700 line-clamp-2 mt-0.5">
                            {product.name}
                        </h3>
                    </div>

                    {/* Weight & Rating */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            {product.weight} {product.weightUnit}
                        </p>
                        <div className="flex items-center space-x-0.5">
                            <AiFillStar className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] sm:text-xs text-gray-600 font-medium">
                                {formatRating(product.averageRating || 0)}
                            </span>
                        </div>
                    </div>

                    {/* Pricing + Add to Cart */}
                    <div className="flex items-end justify-between mt-auto">
                        <div>
                            <p className="text-sm sm:text-lg font-bold text-green-800">
                                Rp {discountedPrice.toLocaleString("id-ID")}
                            </p>
                            {hasRetailDiscount && (
                                <p className="text-[10px] sm:text-xs text-gray-400 line-through">
                                    Rp {product.price.toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>

                        {/* Add to Cart Button - outline style */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || isOutOfStock}
                            className="border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white active:scale-95 p-1.5 sm:p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                            aria-label={isOutOfStock ? t("detail.outOfStock") : t("button.addCart")}
                        >
                            <RiShoppingBasket2Fill className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </Link>
    );
}
