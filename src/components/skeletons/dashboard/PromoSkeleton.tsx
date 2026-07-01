import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function PromoSkeleton() {
    return (
        <div className="space-y-2 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_18rem] gap-2 sm:gap-4">
                <div className="h-40 sm:h-72">
                    <Skeleton height="100%" width="100%" borderRadius="0.75rem" />
                </div>
                <div className="h-40 sm:h-72 sm:w-72">
                    <Skeleton height="100%" width="100%" borderRadius="0.75rem" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="h-32 sm:h-48">
                    <Skeleton height="100%" width="100%" borderRadius="0.75rem" />
                </div>
                <div className="h-32 sm:h-48">
                    <Skeleton height="100%" width="100%" borderRadius="0.75rem" />
                </div>
            </div>
        </div>
    );
}
