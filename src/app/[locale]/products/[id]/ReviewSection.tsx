import ReviewView from "@/components/card/ReviewView";
import RatingStars from "@/components/ui/layout/RatingStar";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
import { SortOrder } from "@/enum/sortOrder";
import { useAllProductReviews } from "@/satelite/services/productService";
import { Product } from "@/types/product/product";
import { useEffect, useRef, useState } from "react";
import { ReviewFilterSection } from "./ReviewFilterSection";
import { getSatisfactionLabel } from "@/utils/getSatisfactionLabel";
import ErrorComponent from "@/components/ui/feedback/Error";
import { ProductRatingSkeleton } from "@/components/skeletons/product/rating/ProductRatingSkeleton";
import { RatingDistributionSkeleton } from "@/components/skeletons/product/rating/RatingDistributionSkeleton";
import LoadingSpinner from "@/components/ui/layout/LoadingSpinner";
import { ReviewSkeleton } from "@/components/skeletons/product/rating/ReviewSkeleton";
import { useTranslations } from "next-intl";
import { useAuth } from "@/satelite/services/authService";

type ReviewSectionProps = {
    product?: Product;
    isLoading: boolean;
};

// Bagian ulasan di halaman detail produk: ringkasan rating (rata-rata + sebaran bintang)
// dan daftar ulasan pembeli, bisa difilter per bintang (via ReviewFilterSection).
export function ReviewSection({ product, isLoading }: ReviewSectionProps) {
    const t = useTranslations("products.review");
    const { data: authData } = useAuth();
    const currentUserId = authData?.sub;
    const observerRef = useRef<HTMLDivElement | null>(null);
    const sortRef = useRef<HTMLDivElement | null>(null);
    const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
    const [hasMedia, setHasMedia] = useState<boolean>(false);
    const [sortValue, setSortValue] = useState<string>("newest");
    const [sortOpen, setSortOpen] = useState<boolean>(false);

    const SORT_MAP: Record<string, { sortField: string; sortOrder: SortOrder }> = {
        newest: { sortField: "createdAt", sortOrder: SortOrder.DESC },
        oldest: { sortField: "createdAt", sortOrder: SortOrder.ASC },
        highest: { sortField: "rating", sortOrder: SortOrder.DESC },
        lowest: { sortField: "rating", sortOrder: SortOrder.ASC },
    };
    const { sortField, sortOrder } = SORT_MAP[sortValue] ?? SORT_MAP.newest;

    const sortOptions = [
        { value: "newest", label: t("sort.newest") },
        { value: "oldest", label: t("sort.oldest") },
        { value: "highest", label: t("sort.highest") },
        { value: "lowest", label: t("sort.lowest") },
    ];
    const currentSortLabel =
        sortOptions.find((o) => o.value === sortValue)?.label ?? sortOptions[0].label;

    const toggleRating = (star: number) => {
        const value = star.toString();
        setSelectedRatings((prev) =>
            prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
        );
    };

    const {
        data: productReviews,
        isPending,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useAllProductReviews(product?.id ?? "", {
        limit: 10,
        sortField,
        sortOrder,
        rating: selectedRatings.length > 0 ? selectedRatings.join(",") : undefined,
        hasReview: hasMedia ? true : undefined,
    });

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
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isError) return <ErrorComponent />;

    const ratingDistribution =
        productReviews?.pages?.[0]?.data?.data?.ratingDistribution || {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

    const reviews =
        productReviews?.pages?.flatMap((page) => page.data.data.reviews) || [];

    const totalRatings = Object.values(ratingDistribution).reduce(
        (sum, n) => sum + Number(n || 0),
        0
    );

    return (
        <section className="w-full mx-auto mt-6 sm:mt-10">
            {/* Title */}
            <div className="mb-3 sm:mb-5">
                <h2 className="text-lg sm:text-2xl font-extrabold text-green-800 mb-1">
                    {t("title")}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                    {t("subtitle")}
                </p>
            </div>

            {/* Rating Summary */}
            <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-200 mb-5 sm:mb-8">
                <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
                    {/* Left Side */}
                    {!isLoading && product ? (
                        <div className="flex flex-col items-center justify-center text-center md:w-1/4 md:border-r md:border-gray-100 md:pr-8">
                            <div className="flex items-end gap-1">
                                <span className="text-5xl font-extrabold text-gray-900 leading-none">
                                    {product?.averageRating?.toFixed(1) || "0.0"}
                                </span>
                                <span className="text-gray-400 text-sm font-medium mb-1">/ 5.0</span>
                            </div>
                            <RatingStars
                                value={product?.averageRating || 0}
                                className="flex gap-0.5 text-yellow-400 text-lg mt-2"
                            />
                            <p className="text-gray-800 mt-2 font-semibold text-sm">
                                {getSatisfactionLabel(
                                    product?.averageRating || 0,
                                    product?.ratingCount || 0,
                                    t
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {product?.ratingCount ?? 0} {t("ratingCount")}
                            </p>
                        </div>
                    ) : (
                        <ProductRatingSkeleton />
                    )}

                    {/* Right Side */}
                    {!isPending && productReviews ? (
                        <div className="flex-1 grid grid-cols-1 gap-1.5 w-full">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingDistribution[star] || 0;
                                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                                const isSelected = selectedRatings.includes(star.toString());
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => toggleRating(star)}
                                        className={`flex items-center gap-2 w-full rounded-lg px-2 py-1 text-sm transition-colors ${
                                            isSelected ? "bg-green-50" : "hover:bg-gray-50"
                                        }`}
                                        aria-pressed={isSelected}
                                    >
                                        <span className="flex w-8 items-center justify-end gap-0.5 text-gray-600">
                                            {star}
                                            <span className="text-yellow-400">★</span>
                                        </span>
                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-2.5 bg-yellow-400 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-9 text-right text-xs text-gray-400">
                                            ({count})
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <RatingDistributionSkeleton />
                    )}
                </div>
            </div>

            {/* Filter + Review Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-6 mt-5 items-start">
                {/* Filter Section */}
                <div className="md:col-span-1 w-full">
                    <ReviewFilterSection
                        isPending={isPending || isLoading}
                        selectedRatings={selectedRatings}
                        onRatingChange={setSelectedRatings}
                        hasMedia={hasMedia}
                        onMediaChange={setHasMedia}
                    />
                </div>
                {/* Review List */}
                <div className="md:col-span-3 w-full">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-base font-bold text-gray-900">{t("reviewsHeading")}</h3>
                        <div className="relative" ref={sortRef}>
                            <button
                                type="button"
                                onClick={() => setSortOpen((o) => !o)}
                                disabled={isPending}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:opacity-50"
                                aria-haspopup="listbox"
                                aria-expanded={sortOpen}
                            >
                                <span className="text-gray-400">{t("sort.label")}:</span>
                                <span className="text-gray-900">{currentSortLabel}</span>
                                <RiArrowDownSLine
                                    size={18}
                                    className={`text-gray-500 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {sortOpen && (
                                <div
                                    role="listbox"
                                    className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                                >
                                    {sortOptions.map((opt) => {
                                        const selected = opt.value === sortValue;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                role="option"
                                                aria-selected={selected}
                                                onClick={() => {
                                                    setSortValue(opt.value);
                                                    setSortOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                                                    selected
                                                        ? "bg-green-50 font-semibold text-green-700"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                {opt.label}
                                                {selected && (
                                                    <RiCheckLine size={16} className="text-green-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {isPending ? (
                        <ReviewSkeleton />
                    ) : (
                        <div className="w-full">
                            <ReviewView reviews={reviews} currentUserId={currentUserId} />
                        </div>
                    )}
                    <div ref={observerRef} className="h-6" />
                    {isFetchingNextPage && (
                        <div className="flex justify-center">
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}