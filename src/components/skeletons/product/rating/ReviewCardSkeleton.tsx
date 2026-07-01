import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ReviewCardSkeleton() {
    return (
        <div className="relative bg-white/80 shadow-sm rounded-2xl p-6 sm:p-5 border border-green-100 hover:shadow-md transition-shadow">
            {/* Header: Avatar + Name + Time + Menu */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar Skeleton */}
                    <Skeleton circle width={36} height={36} />
                    <div className="leading-tight">
                        {/* Name Skeleton */}
                        <Skeleton width={80} height={14} />
                        {/* Time Skeleton */}
                        <Skeleton width={50} height={10} className="mt-1" />
                    </div>
                </div>
                {/* Menu Button Skeleton */}
                <Skeleton width={24} height={24} borderRadius={999} />
            </div>

            {/* Rating Skeleton */}
            <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} width={18} height={18} borderRadius={4} />
                ))}
            </div>

            {/* Review Content Skeleton */}
            <Skeleton count={2} height={14} className="mb-1" />
            <Skeleton width="70%" height={14} />
        </div>
    );
}