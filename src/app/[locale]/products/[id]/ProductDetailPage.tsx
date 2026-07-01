"use client";

import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import GroceryOfferCard from "@/components/card/GroceryOfferCard";
import ErrorComponent from "@/components/ui/feedback/Error";
import BuyNowModal from "@/components/modal/BuyNowModal";
import WishlistSavedSheet from "@/components/modal/WishlistSavedSheet";
import ProductDetailSkeleton from "@/components/skeletons/product/ProductDetailSkeleton";
import { PriceType } from "@/enum/priceType";
import { useAuth } from "@/satelite/services/authService";
import { useAddCart } from "@/satelite/services/cartService";
import { useProductById, useRecordProductView } from "@/satelite/services/productService";
import { useWishlistIds, useAddWishlist, useRemoveWishlist } from "@/satelite/services/wishlistService";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BsBoxes, BsLightningChargeFill } from "react-icons/bs";
import { RiShoppingBasket2Line } from "react-icons/ri";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { GiWeightCrush } from "react-icons/gi";
import { toast } from "react-toastify";
import RatingStars from "@/components/ui/layout/RatingStar";
import { ReviewSection } from "./ReviewSection";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import { formatRating } from "@/utils/formatRating";
import { useTranslations } from "next-intl";

type ProductDetailPageProps = {
    productId: string;
};

// useLayoutEffect di klien (reset scroll SEBELUM paint → tanpa lompatan), tapi
// pakai useEffect saat SSR supaya tidak memunculkan warning.
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ProductDetail({ productId }: ProductDetailPageProps) {
    const router = useRouter();
    const t = useTranslations("products.detail");
    const tBtn = useTranslations("products.button");
    const tWish = useTranslations("wishlist");

    const { data: product, isPending: isLoading, isError } = useProductById(productId);

    // Di production (App Router + loading.tsx streaming), navigasi dari daftar
    // produk yang sudah ter-scroll kadang tidak reset ke atas di desktop — posisi
    // scroll lama "terbawa" hingga mendarat di bagian ulasan. Reset SEBELUM paint
    // (useLayoutEffect) agar frame pertama sudah di atas — tanpa lompatan terlihat.
    useIsomorphicLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);

    const { data: user, isLoading: isLoadingAuth } = useAuth();
    const { mutate: addCart, isPending } = useAddCart();

    // Wishlist (favourite) state for this product.
    const isLoggedIn = !!user && user.exp >= Date.now() / 1000;
    const { data: wishlistIdsData } = useWishlistIds(isLoggedIn);
    const { mutate: addToWishlist, isPending: isAddingWishlist } = useAddWishlist();
    const { mutate: removeFromWishlist, isPending: isRemovingWishlist } = useRemoveWishlist();
    const isWishlisted = !!product?.data?.id && (wishlistIdsData?.data ?? []).includes(product.data.id);
    const [heartKey, setHeartKey] = useState(0);
    const [showSavedSheet, setShowSavedSheet] = useState(false);
    const prevWishlistedRef = useRef<boolean | null>(null);

    // Catat produk yang dibuka (sinyal rekomendasi content-based) — sekali per produk,
    // hanya untuk user login. Best-effort; gagal tidak mengganggu UI.
    const { mutate: trackView } = useRecordProductView();
    const trackedRef = useRef<string | null>(null);
    useEffect(() => {
        const pid = product?.data?.id;
        if (pid && isLoggedIn && trackedRef.current !== pid) {
            trackedRef.current = pid;
            trackView(pid);
        }
    }, [product?.data?.id, isLoggedIn, trackView]);

    useEffect(() => {
        // Tunggu kedua data siap (produk + daftar wishlist) sebelum menetapkan
        // baseline — kalau tidak, urutan load yang berbeda bisa salah deteksi
        // "false → true" dan memunculkan modal padahal user tidak klik apa-apa.
        if (!Array.isArray(wishlistIdsData?.data) || !product?.data?.id) return;
        if (prevWishlistedRef.current === null) {
            prevWishlistedRef.current = isWishlisted;
            return;
        }
        if (isWishlisted && !prevWishlistedRef.current) {
            setHeartKey(k => k + 1);
            setShowSavedSheet(true);
        }
        prevWishlistedRef.current = isWishlisted;
    }, [isWishlisted, wishlistIdsData, product?.data?.id]);

    const handleToggleWishlist = () => {
        if (!user || user.exp < Date.now() / 1000) {
            router.push("/login");
            return;
        }
        const pid = product?.data?.id;
        if (!pid || isAddingWishlist || isRemovingWishlist) return;

        if (isWishlisted) {
            removeFromWishlist(pid, {
                onSuccess: () => toast.success(tWish("removed")),
                onError: () => toast.error(tWish("error")),
            });
        } else {
            addToWishlist(pid, {
                onError: () => toast.error(tWish("error")),
            });
        }
    };

    const stockProduct = product?.data?.stock || 0;
    const minQuantity = Number(product?.data?.minQuantityForDiscount) || 12;
    const [quantity, setQuantity] = useState<number>(1);
    const [isActiveDefault, setIsActiveDefault] = useState(true);
    const [isActiveBulk, setIsActiveBulk] = useState(false);
    const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);

    // Apakah opsi grosir tersedia & apakah stok cukup untuk mencapai minimumnya.
    const bulkAvailable =
        product?.data?.bulkDiscountEnabled !== false && (product?.data?.bulkDiscountPrice || 0) > 0;
    const canSelectBulk = bulkAvailable && stockProduct >= minQuantity;

    // Badge diskon di gambar — ambil yang TERBESAR antara diskon normal & grosir
    // (Math.floor agar konsisten dengan badge di ProductCard).
    const normalDiscountPct = product?.data?.discountPercentage ?? 0;
    const productPrice = product?.data?.price ?? 0;
    const bulkPriceVal = product?.data?.bulkDiscountPrice ?? 0;
    const bulkDiscountPct =
        bulkAvailable && productPrice > 0 && bulkPriceVal < productPrice
            ? Math.floor(((productPrice - bulkPriceVal) / productPrice) * 100)
            : 0;
    const badgeDiscount = Math.max(normalDiscountPct, bulkDiscountPct);
    const isOutOfStock = stockProduct <= 0;
    const remainingStock = Math.max(0, stockProduct - quantity);
    // Boleh checkout hanya jika ada stok, qty dalam rentang, dan jika grosir aktif qty memenuhi minimum.
    const canPurchase =
        !isOutOfStock &&
        quantity >= 1 &&
        quantity <= stockProduct &&
        (!isActiveBulk || quantity >= minQuantity);

    const calculateTotalPrice = useMemo(() => {
        if (!product || !product.data) return { originalPrice: 0, discountedPrice: 0 };

        const { minQuantityForDiscount, bulkDiscountPrice, price, discountPercentage = 0, discountPrice } = product.data;

        const minQuantity = Number(minQuantityForDiscount) || 0;
        const bulkPrice = Number(bulkDiscountPrice) || 0;
        const normalPrice = Number(price) || 0;
        const discountPriceValue = Number(discountPrice) || 0;

        const originalPrice = quantity * normalPrice;
        let discountedPrice = originalPrice;

        // Grosir hanya kalau harga grosir valid (> 0) & qty memenuhi minimum.
        // Tanpa guard ini, produk tanpa grosir bisa membuat total jadi 0.
        if (isActiveBulk && bulkPrice > 0 && quantity >= minQuantity) {
            discountedPrice = quantity * bulkPrice;
        } else if (discountPercentage > 0) {
            discountedPrice = quantity * discountPriceValue;
        }

        return { originalPrice, discountedPrice };
    }, [quantity, product, isActiveBulk]);

    const handleTypeChangeToDefault = () => {
        setIsActiveDefault(true);
        setIsActiveBulk(false);

        if (quantity >= minQuantity) {
            setQuantity(Math.max(1, 1));
        }
    };

    const handleTypeChangeToBulk = () => {
        // Cegah pilih grosir kalau stok belum mencapai minimum grosir.
        if (stockProduct < minQuantity) {
            toast.info(t("bulkStockInsufficient", { qty: minQuantity }));
            return;
        }

        setIsActiveDefault(false);
        setIsActiveBulk(true);

        if (quantity < minQuantity) {
            setQuantity(Math.min(minQuantity, stockProduct));
        }
    };

    const handleDecrease = () => {
        setQuantity(prev => {
            const newQuantity = Math.max(1, prev - 1);

            // Hanya pindah ke grosir kalau produk memang punya harga grosir.
            const useBulk = bulkAvailable && newQuantity >= minQuantity;
            setIsActiveDefault(!useBulk);
            setIsActiveBulk(useBulk);

            return newQuantity;
        });
    };

    const handleIncrease = () => {
        setQuantity(prev => {
            const newQuantity = Math.min(stockProduct, prev + 1);

            // Hanya pindah ke grosir kalau produk memang punya harga grosir.
            const useBulk = bulkAvailable && newQuantity >= minQuantity;
            setIsActiveDefault(!useBulk);
            setIsActiveBulk(useBulk);

            return newQuantity;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            let numValue = Number(value);
            if (numValue < 1) numValue = 1;
            if (numValue > stockProduct) numValue = stockProduct;

            setQuantity(numValue);
            const useBulk = bulkAvailable && numValue >= minQuantity;
            setIsActiveBulk(useBulk);
            setIsActiveDefault(!useBulk);
        }
    };

    const handleAddToCart = () => {
        if (!user || user.exp < Date.now() / 1000) {
            router.push("/login");
            return;
        }

        if (!product) return;

        if (!product?.data?.id) {
            toast.error(tBtn("addCartFail"));
            return;
        }

        if (isOutOfStock) {
            toast.error(t("outOfStock"));
            return;
        }
        if (quantity < 1 || quantity > stockProduct) {
            toast.error(t("invalidQuantity"));
            return;
        }
        if (isActiveBulk && quantity < minQuantity) {
            toast.error(t("bulkStockInsufficient", { qty: minQuantity }));
            return;
        }

        const cartItem = {
            productId: product.data.id,
            quantity: quantity,
            priceType: isActiveBulk ? PriceType.WHOLESALE : PriceType.REGULAR,
        };

        addCart(cartItem, {
            onSuccess: () => {
                toast.success(tBtn("addCartSuccess"));
            },
            onError: (error) => {
                console.error("Error adding product to cart:", error);
                toast.error(tBtn("addCartFail"));
            },
        });
    };

    const handleBuyNow = () => {
        if (!user || user.exp < Date.now() / 1000) {
            router.push("/login");
            return;
        }

        if (isOutOfStock) {
            toast.error(t("outOfStock"));
            return;
        }
        if (quantity < 1 || quantity > stockProduct) {
            toast.error(t("invalidQuantity"));
            return;
        }
        if (isActiveBulk && quantity < minQuantity) {
            toast.error(t("bulkStockInsufficient", { qty: minQuantity }));
            return;
        }

        setIsBuyNowModalOpen(true)
    }

    useEffect(() => {
        const shouldLockScroll = isBuyNowModalOpen;

        if (shouldLockScroll) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isBuyNowModalOpen]);

    if (isError) return <ErrorComponent />;
    if (!isLoading && !product?.data) return <ErrorComponent />;

    return (
        <>
            <WishlistSavedSheet isOpen={showSavedSheet} onClose={() => setShowSavedSheet(false)} />
            {isBuyNowModalOpen && user != null && (
                <BuyNowModal
                    isCartOpen={isBuyNowModalOpen}
                    onClose={() => setIsBuyNowModalOpen(false)}
                    userId={user?.sub}
                    product={product?.data}
                    quantityData={quantity}
                />
            )}
            <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="container w-full px-2 sm:px-4 pt-3 pb-5 mx-auto">
                    <Breadcrumbs
                        items={[
                            { label: t("breadcrumb.dashboard"), href: "/" },
                            { label: t("breadcrumb.products"), href: "/products" },
                            ...(product && product?.data?.name
                                ? [{ label: product.data.name }]
                                : []),
                        ]}
                    />
                    <div className="container mx-auto py-2 flex flex-col lg:flex-row gap-6 lg:gap-12">
                        {isLoading || isLoadingAuth ? (
                            <ProductDetailSkeleton />
                        ) : (
                            <>
                                {/* Product Image Section */}
                                <div className="flex-1 lg:w-1/2 sm:min-h-[320px] lg:min-h-[480px] flex items-stretch">
                                    <div className="w-full h-full flex flex-col rounded-3xl border-2 border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
                                        <div className="relative w-full aspect-square sm:aspect-auto sm:flex-1 flex items-center justify-center bg-white rounded-2xl p-3 sm:p-6 shadow-[0_2px_18px_2px_rgba(0,0,0,0.08)]">
                                        <Image
                                            src={product?.data?.imageUrl || '/images/default-product.png'}
                                            alt={product?.data?.name || t("imageAlt")}
                                            width={400}
                                            height={400}
                                            className="max-w-[85%] max-h-[85%] sm:max-w-[70%] sm:max-h-[70%] lg:max-w-[60%] lg:max-h-[60%] w-auto h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {badgeDiscount > 0 && (
                                            <div className="absolute top-0 right-0">
                                                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-2xl block">
                                                    {badgeDiscount}%
                                                </span>
                                            </div>
                                        )}
                                        {product?.data?.categoryName && (
                                            <span className="absolute bottom-0 left-0">
                                                <span className="bg-[#FDBA12] text-gray-700 text-sm font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-xl block">
                                                    {product.data.categoryName}
                                                </span>
                                            </span>
                                        )}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Details Section */}
                                <div className="flex-1 flex flex-col gap-4 sm:gap-6">
                                    {/* Product Name and Description */}
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <h1 className="text-2xl sm:text-4xl font-bold leading-tight text-green-900">
                                                {product?.data?.name}
                                            </h1>
                                            <button
                                                type="button"
                                                onClick={handleToggleWishlist}
                                                disabled={isAddingWishlist || isRemovingWishlist}
                                                aria-label={isWishlisted ? tWish("remove") : tWish("add")}
                                                title={isWishlisted ? tWish("remove") : tWish("add")}
                                                className="shrink-0 transition active:scale-90 disabled:opacity-50"
                                            >
                                                {isWishlisted
                                                    ? <AiFillHeart key={heartKey} size={36} style={{ color: "#EE0979" }} className="drop-shadow-sm heart-pop" />
                                                    : <AiOutlineHeart size={36} className="text-gray-500 [@media(hover:hover)]:hover:opacity-70 transition-opacity duration-200" />
                                                }
                                            </button>
                                        </div>
                                        {(product?.data?.weight ?? 0) > 0 && product?.data?.weightUnit && (
                                            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                                                <GiWeightCrush className="h-4 w-4 text-gray-400" />
                                                {product.data.weight} {product.data.weightUnit}
                                            </span>
                                        )}
                                        {product?.data?.description && (
                                            <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-900/70">{product?.data?.description}</p>
                                        )}
                                    </div>

                                    {/* Product Price and Rating */}
                                    <div className="flex flex-wrap items-end justify-between gap-3">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl sm:text-4xl font-extrabold text-green-700">
                                                Rp&nbsp;{(product?.data?.discountPercentage ?? 0) > 0 && product?.data?.discountPrice
                                                    ? product?.data?.discountPrice.toLocaleString("id-ID")
                                                    : product?.data?.price.toLocaleString("id-ID")}
                                            </span>
                                            {(product?.data?.discountPercentage ?? 0) > 0 && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    Rp&nbsp;{product?.data?.price.toLocaleString("id-ID")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1">
                                            <span className="flex text-yellow-400">
                                                <RatingStars value={product.data.averageRating} className="flex" />
                                            </span>
                                            <span className="text-xs font-semibold text-amber-700">
                                                {formatRating(product.data.averageRating)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Offer Cards */}
                                    <GroceryOfferCard
                                        minQuantityForDiscount={minQuantity || 0}
                                        discount={product?.data?.discountPercentage || 0}
                                        discountPrice={product?.data?.discountPrice || 0}
                                        price={product?.data?.price || 0}
                                        bulkDiscountPrice={product?.data?.bulkDiscountPrice || 0}
                                        unit={product?.data?.unit || ""}
                                        isActive={isActiveDefault}
                                        isDefault={true}
                                        disabled={isOutOfStock}
                                        onClick={handleTypeChangeToDefault}
                                    />
                                    {bulkAvailable && (
                                        <GroceryOfferCard
                                            minQuantityForDiscount={minQuantity || 0}
                                            discount={product?.data?.discountPercentage || 0}
                                            discountPrice={product?.data?.discountPrice || 0}
                                            price={product?.data?.price || 0}
                                            bulkDiscountPrice={product?.data?.bulkDiscountPrice || 0}
                                            unit={product?.data?.unit || ""}
                                            isActive={isActiveBulk}
                                            isDefault={false}
                                            disabled={!canSelectBulk}
                                            note={!canSelectBulk ? t("bulkStockInsufficient", { qty: minQuantity }) : undefined}
                                            onClick={handleTypeChangeToBulk}
                                        />
                                    )}

                                    {/* Quantity Selection + Stock */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        {!isOutOfStock && (
                                            <>
                                            <span className="text-sm font-medium text-gray-600">{t("quantity")}</span>
                                            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                                                <button
                                                    className="flex h-9 w-9 items-center justify-center text-lg text-green-800 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                                    onClick={handleDecrease}
                                                    disabled={quantity <= 1}
                                                >
                                                    &minus;
                                                </button>
                                                <input
                                                    type="text"
                                                    className="h-9 w-12 border-x border-gray-200 text-center text-sm font-bold text-green-900 focus:outline-none"
                                                    value={quantity}
                                                    onChange={handleInputChange}
                                                />
                                                <button
                                                    className="flex h-9 w-9 items-center justify-center text-lg text-green-800 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                                    onClick={handleIncrease}
                                                    disabled={quantity >= stockProduct}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            </>
                                        )}

                                        {/* Stock Information */}
                                        <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                                            <BsBoxes size={14} />
                                            <span>{isOutOfStock ? t("outOfStock") : t("stockInfo", { remaining: remainingStock })}</span>
                                        </div>
                                    </div>

                                    {/* Total Price */}
                                    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                                        <p className="text-sm font-medium text-gray-600">{t("totalPrice")}</p>
                                        <div className="text-right">
                                            {calculateTotalPrice.discountedPrice !== calculateTotalPrice.originalPrice && (
                                                <p className="text-xs text-gray-400 line-through">
                                                    Rp&nbsp;{calculateTotalPrice.originalPrice.toLocaleString("id-ID")}
                                                </p>
                                            )}
                                            <p className="text-2xl sm:text-3xl font-extrabold text-green-700">
                                                Rp&nbsp;{calculateTotalPrice.discountedPrice.toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex w-full gap-3 font-semibold">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isPending || !canPurchase}
                                            className="flex w-1/2 items-center justify-center gap-2 rounded-xl border-2 border-green-700 px-3 py-3 text-green-800 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <RiShoppingBasket2Line size={18} className="hidden sm:block relative -top-px" />
                                            <span className="sm:hidden">{isPending ? "..." : `+ ${tBtn("addCartShort")}`}</span>
                                            <span className="hidden sm:inline">{isPending ? tBtn("adding") : tBtn("addCart")}</span>
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={isPending || !canPurchase}
                                            className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-green-700 px-3 py-3 text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <BsLightningChargeFill size={16} />
                                            <span>{isOutOfStock ? t("outOfStock") : tBtn("buyNow")}</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {productId && <FrequentlyBoughtTogether productId={productId} />}

                    <ReviewSection product={product?.data} isLoading={isLoading} />
                </div>
            </div>
        </>
    );
}