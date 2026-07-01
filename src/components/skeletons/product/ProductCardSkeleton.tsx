import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const ProductCardSkeleton = () => {
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Image Area */}
            <div className="relative w-full h-40 sm:h-44 bg-white p-2 sm:p-4">
                <Skeleton height="100%" />
                {/* Discount badge kanan atas */}
                <div className="absolute top-0 right-0">
                    <Skeleton width={36} height={24} />
                </div>
                {/* Kategori badge kiri bawah */}
                <div className="absolute bottom-0 left-0">
                    <Skeleton width={60} height={20} />
                </div>
            </div>

            {/* Info Section */}
            <div className="p-2.5 sm:p-4 flex flex-col flex-1 space-y-2">
                {/* Brand & Name */}
                <div>
                    <Skeleton width={50} height={10} />
                    <Skeleton width="80%" height={14} className="mt-1" />
                    <Skeleton width="60%" height={14} />
                </div>

                {/* Weight & Rating */}
                <div className="flex items-center justify-between">
                    <Skeleton width={50} height={10} />
                    <Skeleton width={36} height={12} />
                </div>

                {/* Price + Cart Button */}
                <div className="flex items-end justify-between mt-auto pt-1">
                    <div>
                        <Skeleton width={90} height={20} />
                        <Skeleton width={60} height={12} className="mt-1" />
                    </div>
                    <Skeleton width={36} height={36} borderRadius={8} />
                </div>
            </div>
        </div>
    );
};
