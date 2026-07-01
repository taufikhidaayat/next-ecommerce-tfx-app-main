import { ReviewCardSkeleton } from "./ReviewCardSkeleton";

export function ReviewSkeleton({ count = 4 }) {
    return (
        <div className="w-full mx-auto space-y-4">
            {Array.from({ length: count }).map((_, idx) => (
                <ReviewCardSkeleton key={idx} />
            ))}
        </div>
    );
}