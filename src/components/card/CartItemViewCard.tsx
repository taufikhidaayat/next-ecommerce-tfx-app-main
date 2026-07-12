import { PriceType } from "@/enum/priceType";
import { DEFAULT_PRODUCT_URL } from "@/lib/constant";
import { CartItems } from "@/types/order/cartItems";
import { ProductPriceInput } from "@/types/statistics/productPriceInput";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculateSubtotalPrice, calculateUnitPrice } from "@/utils/productPricing";
import Image from "next/image";
import Link from "next/link";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type CartItemViewCardProps = {
    cartItems: CartItems;
    onIncrease?: (id: string) => void;
    onDecrease?: (id: string) => void;
    onDelete?: (id: string) => void;
    onQuantityChange?: (id: string, qty: number) => void;
    onNavigate?: () => void;
    isBuyNow?: boolean;
    isSelectMode?: boolean;
    isSelected?: boolean;
}

// Varian tampilan kartu daftar item keranjang (dipakai di konteks tertentu, mis. ringkasan).
export default function CartItemsViewCard({
    cartItems,
    onIncrease,
    onDecrease,
    onDelete,
    onQuantityChange,
    onNavigate,
    isBuyNow,
    isSelectMode = false,
    isSelected = false,
}: CartItemViewCardProps) {
    const t = useTranslations("cartItem");

    const [qtyInput, setQtyInput] = useState<string>(String(cartItems.quantity));

    useEffect(() => {
        setQtyInput(String(cartItems.quantity));
    }, [cartItems.quantity]);

    const commitQuantity = () => {
        if (!onQuantityChange) return;
        const parsed = parseInt(qtyInput, 10);
        if (Number.isNaN(parsed) || parsed < 1) {
            setQtyInput(String(cartItems.quantity));
            return;
        }
        if (parsed === cartItems.quantity) return;
        onQuantityChange(cartItems.id, parsed);
    };

    const priceType: PriceType =
        cartItems.product.bulkDiscountEnabled === false ||
        cartItems.quantity < (Number(cartItems.product.minQuantityForDiscount) || 0)
            ? PriceType.REGULAR
            : PriceType.WHOLESALE;

    const productPriceInput: ProductPriceInput = {
        quantity: cartItems.quantity,
        product: cartItems.product,
    };

    const initalPrice = cartItems.product.price;
    const actualPrice = calculateUnitPrice(productPriceInput);
    const initialSubTotalPrice = cartItems.product.price * cartItems.quantity;
    const actualSubtotalPrice = calculateSubtotalPrice(productPriceInput);
    const hasDiscount = initalPrice > actualPrice;

    const getPriceLabel = () => {
        switch (priceType) {
            case PriceType.REGULAR:
                return t("retail");
            case PriceType.WHOLESALE:
                return t("wholesale");
            default:
                return t("price");
        }
    };

    const tag = getPriceLabel();

    // Seluruh kartu bisa diklik menuju detail produk, dimatikan di mode buy-now / select
    const productId = cartItems.product.id;
    const isLinkable = !isBuyNow && !isSelectMode && Boolean(productId);
    const productName = cartItems.product.name ?? t("unnamed");

    const thumbnailClass = "relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-gray-100 bg-gray-50";

    const thumbnailImage = (
        <Image
            src={cartItems.product.imageUrl || DEFAULT_PRODUCT_URL}
            alt={cartItems.product.name || t("productImage")}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className={`object-cover ${isLinkable ? "transition-transform duration-300 group-hover:scale-110" : ""}`}
        />
    );

    const nameHeading = (
        <h3 className={`text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 leading-snug ${isLinkable ? "transition-colors group-hover:text-emerald-700" : ""}`}>
            {productName}
        </h3>
    );

    return (
        <div className={`group relative bg-white rounded-2xl p-3 sm:p-4 border shadow-[0_2px_10px_-2px_rgba(16,185,129,0.08)] hover:shadow-[0_6px_24px_-6px_rgba(16,185,129,0.2)] transition-all duration-300 min-w-0 ${isSelected ? "border-emerald-400 ring-2 ring-inset ring-emerald-500" : "border-gray-200 hover:border-emerald-300"}`}>
            {/* Delete - ghost icon, prominent on hover, hidden in select mode */}
            {!isBuyNow && !isSelectMode && (
                <button
                    onClick={() => onDelete?.(cartItems.id)}
                    className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 sm:opacity-60 sm:group-hover:opacity-100"
                    aria-label={t("delete")}
                    type="button"
                >
                    <FiTrash2 size={16} />
                </button>
            )}

            {/* Overlay link: klik di mana saja pada kartu menuju detail produk.
                Kontrol qty & tombol hapus diangkat ke z-10 agar tetap bisa diklik sendiri. */}
            {isLinkable && (
                <Link
                    href={`/products/${productId}`}
                    onClick={onNavigate}
                    aria-label={productName}
                    className="absolute inset-0 z-0 rounded-2xl"
                />
            )}

            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                {/* Thumbnail - larger, rounded-2xl */}
                <div className={thumbnailClass}>
                    {thumbnailImage}
                </div>

                {/* Right side */}
                <div className="flex-1 min-w-0 flex flex-col gap-2 pr-6 sm:pr-7">
                    {/* Name + price + tag */}
                    <div className="min-w-0">
                        {nameHeading}
                        <div className="flex items-baseline gap-1.5 mt-1 text-xs sm:text-sm">
                            {hasDiscount && (
                                <span className="line-through text-red-400">
                                    {formatCurrency(initalPrice)}
                                </span>
                            )}
                            <span className="text-gray-700 font-medium">
                                {formatCurrency(actualPrice)}
                            </span>
                        </div>
                        <span className={`inline-flex items-center text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                            priceType === PriceType.WHOLESALE
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        }`}>
                            {tag}
                        </span>
                    </div>

                    {/* Bottom row: qty stepper + subtotal */}
                    <div className="flex items-end justify-between gap-2 mt-1">
                        {/* Pill stepper */}
                        <div className="relative z-10 inline-flex items-center rounded-full ring-1 ring-emerald-200 bg-white overflow-hidden">
                            <button
                                onClick={() => onDecrease?.(cartItems.id)}
                                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent"
                                aria-label={t("decrease")}
                                type="button"
                            >
                                <FiMinus size={14} />
                            </button>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={qtyInput}
                                onChange={(e) => setQtyInput(e.target.value.replace(/\D/g, ""))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).blur();
                                        return;
                                    }
                                    if (
                                        e.key.length === 1 &&
                                        !/[0-9]/.test(e.key) &&
                                        !e.ctrlKey && !e.metaKey
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                onBlur={commitQuantity}
                                disabled={!onQuantityChange}
                                className="w-8 sm:w-10 text-center text-sm sm:text-base font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 disabled:text-gray-700"
                                aria-label={t("quantity")}
                            />
                            <button
                                onClick={() => onIncrease?.(cartItems.id)}
                                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent"
                                aria-label={t("increase")}
                                type="button"
                            >
                                <FiPlus size={14} />
                            </button>
                        </div>

                        {/* Subtotal block */}
                        <div className="flex flex-col items-end text-right min-w-0">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                {t("subtotal")}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] sm:text-xs line-through text-red-400 leading-tight">
                                    {formatCurrency(initialSubTotalPrice)}
                                </span>
                            )}
                            <span className="text-sm sm:text-lg font-bold text-emerald-700 leading-tight">
                                {formatCurrency(actualSubtotalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
