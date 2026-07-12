"use client";

import { useState } from "react";
import Link from "next/link";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { useTranslations } from "next-intl";
import { useCartsByUserId } from "@/satelite/services/cartService";
import { calculateUnitPrice } from "@/utils/productPricing";
import { formatCurrency } from "@/utils/formatCurrency";

const MAX_PREVIEW_ITEMS = 5;

interface CartMenuProps {
    onOpenCart: () => void;
    /** "desktop" shows the hover preview; "mobile" is just the button + badge. */
    variant?: "desktop" | "mobile";
}

// Ikon keranjang di navbar dengan badge jumlah item. Klik → membuka panel keranjang.
// variant menyesuaikan tampilan untuk desktop vs mobile.
export default function CartMenu({ onOpenCart, variant = "desktop" }: CartMenuProps) {
    const t = useTranslations("header");
    const tBtn = useTranslations("button");

    const [open, setOpen] = useState(false);

    const { data } = useCartsByUserId();
    const cartItems = data?.data?.itemOrder ?? [];
    const count = cartItems.length;

    // The API already returns items newest-first (createdAt desc).
    const previewItems = cartItems.slice(0, MAX_PREVIEW_ITEMS);
    const remaining = count - previewItems.length;

    const badge =
        count > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
                {count > 99 ? "99+" : count}
            </span>
        ) : null;

    // Mobile: simple button that opens the cart modal on tap (no hover preview).
    if (variant === "mobile") {
        return (
            <button
                className="relative p-2 bg-[#0B4540] rounded-full hover:bg-[#0a5b54] focus:outline-none transition"
                onClick={onOpenCart}
                aria-label={tBtn("cart")}
            >
                <RiShoppingBasket2Fill className="text-white text-xl" />
                {badge}
            </button>
        );
    }

    const closeMenu = () => setOpen(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                className="relative p-1.5 bg-[#0B4540] rounded-full hover:bg-[#0a5b54] focus:outline-none transition duration-300"
                onClick={() => {
                    onOpenCart();
                    closeMenu();
                }}
                aria-label={tBtn("cart")}
            >
                <RiShoppingBasket2Fill className="text-white text-xl" />
                {badge}
            </button>

            {/* Hover preview (Shopee-style). pt-3 keeps the hover bridge gap-free. */}
            <div
                className={`absolute right-0 top-full z-50 w-[26rem] pt-3 transition-all duration-200 ${
                    open
                        ? "visible translate-y-0 opacity-100"
                        : "invisible translate-y-1 opacity-0"
                }`}
            >
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white text-gray-800 shadow-2xl">
                    {count === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <RiShoppingBasket2Fill className="mx-auto mb-2 text-gray-300" size={32} />
                            <p className="text-sm text-gray-400">{t("cartEmptyShort")}</p>
                        </div>
                    ) : (
                        <>
                            <p className="px-4 pt-3 pb-2 text-sm font-medium text-gray-400">
                                {t("cartPreviewTitle")}
                            </p>
                            <ul className="max-h-72 overflow-y-auto">
                                {previewItems.map((item) => {
                                    const unitPrice = calculateUnitPrice({
                                        quantity: item.quantity,
                                        product: item.product,
                                    });
                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={`/products/${item.productId}`}
                                                onClick={closeMenu}
                                                className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-gray-50"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="h-10 w-10 shrink-0 rounded-md border border-gray-100 object-cover"
                                                />
                                                <p className="min-w-0 flex-1 truncate text-sm text-gray-700">
                                                    {item.product.name}
                                                </p>
                                                <span className="shrink-0 text-sm font-medium text-emerald-600">
                                                    {formatCurrency(unitPrice)}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
                                <span className="whitespace-nowrap text-xs text-gray-400">
                                    {remaining > 0 ? t("cartMoreItems", { count: remaining }) : ""}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onOpenCart();
                                        closeMenu();
                                    }}
                                    className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    {t("viewCart")}
                                </button>

                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
