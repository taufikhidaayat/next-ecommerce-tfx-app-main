import { ProductReview } from "@/types/product/productReview";
import ReviewCard from "./ReviewCard";
import { DataNotFound } from "../ui/feedback/DataNotFound";
import { useTranslations } from "next-intl";

type ReviewViewProps = {
    reviews: ProductReview[];
    currentUserId?: string;
};

// Daftar ulasan: merender banyak ReviewCard, menandai mana ulasan milik user sendiri.
export default function ReviewView({ reviews, currentUserId }: ReviewViewProps) {
    const t = useTranslations("reviewView");

    if (!reviews?.length) {
        return (
            <div className="col-span-full">
                <DataNotFound
                    title={t("notFoundTitle")}
                    description={t("notFoundDesc")}
                />
            </div>
        );
    }

    // Pin user's own reviews at the top
    const sortedReviews = currentUserId
        ? [
            ...reviews.filter((r) => r.userId === currentUserId),
            ...reviews.filter((r) => r.userId !== currentUserId),
          ]
        : reviews;

    return (
        <div className="w-full mx-auto space-y-3">
            {sortedReviews.map((review, index) => (
                <ReviewCard
                    key={index}
                    review={review}
                    isOwner={!!currentUserId && review.userId === currentUserId}
                />
            ))}
        </div>
    );
}
