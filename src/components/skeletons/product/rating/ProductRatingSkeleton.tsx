import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ProductRatingSkeleton() {
    return (
        <div className="flex flex-col items-start md:items-center md:w-1/5">
            <div className="flex items-center text-yellow-500 text-3xl font-bold">
                {/* Skeleton for star and rating number */}
                <Skeleton circle width={32} height={32} className="mr-2" />
                <Skeleton width={40} height={32} />
                <span className="text-gray-500 text-lg font-normal ml-1">
                    / 5.0
                </span>
            </div>
            {/* Satisfaction label skeleton */}
            <Skeleton width={100} height={20} className="mt-2" />
            {/* Review count skeleton */}
            <Skeleton width={80} height={16} className="mt-2" />
        </div>
    );
}