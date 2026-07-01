import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function RatingDistributionSkeleton() {
    return (
        <div className="flex-1 mt-6 md:mt-0 md:ml-8 grid grid-cols-1 gap-2 w-full">
            {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center text-sm text-gray-600">
                    {/* Star Icon */}
                    <Skeleton width={18} height={18} borderRadius={999} className="mr-2" />
                    {/* Star Number */}
                    <Skeleton width={16} height={16} className="mr-2" />
                    {/* Bar */}
                    <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                        <Skeleton height={8} width="100%" />
                    </div>
                    {/* Count */}
                    <Skeleton width={28} height={14} className="ml-2" />
                </div>
            ))}
        </div>
    );
}