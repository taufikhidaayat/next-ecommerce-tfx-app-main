'use client';

import { OrderItems } from '@/types/order/orderItems';
import { FaStar } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_PRODUCT_URL } from '@/lib/constant';
import { useTranslations } from 'next-intl';

type OrderReviewsProps = {
    items: OrderItems[];
};

export default function OrderReviews({ items }: OrderReviewsProps) {
    const t = useTranslations("orderDetail.reviews");

    const reviewedItems = items.filter(item => item.isReviewed && item.productRating);

    if (reviewedItems.length === 0) return null;

    return (
        <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border space-y-4">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-green-700 flex items-center gap-2">
                        <FaStar className="text-yellow-400" />
                        {t("title")}
                    </h2>
                    <span className="text-xs sm:text-sm text-gray-400 font-medium">
                        {reviewedItems.length} {reviewedItems.length === 1 ? t("reviewCount") : t("reviewCountPlural")}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t("subtitle")}</p>
                <hr className="mt-3 border-gray-200" />
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
                {reviewedItems.map((item) => (
                    <Link
                        key={item.id}
                        href={`/products/${item.productId}`}
                        className="block group"
                    >
                        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 group-hover:border-green-300 group-hover:shadow-md transition-all duration-200">
                            {/* Product Image */}
                            <div className="shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition">
                                <Image
                                    src={item.productImageUrl || DEFAULT_PRODUCT_URL}
                                    alt={item.productName}
                                    fill
                                    sizes="80px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Product Name */}
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition truncate">
                                        {item.productName}
                                    </h3>
                                    <FiExternalLink className="text-sm text-gray-300 group-hover:text-green-500 shrink-0 transition" />
                                </div>

                                {/* Stars */}
                                <div className="flex items-center gap-0.5 mt-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`text-sm ${
                                                star <= (item.productRating?.rating ?? 0)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    ))}
                                    <span className="ml-1.5 text-xs font-medium text-gray-500">
                                        {item.productRating?.rating}/5
                                    </span>
                                </div>

                                {/* Comment */}
                                {item.productRating?.comment && (
                                    <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 italic">
                                        &ldquo;{item.productRating.comment}&rdquo;
                                    </p>
                                )}

                                {/* Footer badges */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        item.productRating?.isPublic
                                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                            : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                                    }`}>
                                        {item.productRating?.isPublic ? t("public") : t("private")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
