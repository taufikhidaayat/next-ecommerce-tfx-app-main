import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const BrandCardSkeleton = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-green-50 border border-green-200 p-5 rounded-xl min-h-[220px]">
            <div className="w-28 h-28 flex items-center justify-center mb-4 bg-white rounded-full shadow-sm border border-green-100">
                <Skeleton circle width={72} height={72} />
            </div>
            <Skeleton width={80} height={20} />
        </div>
    );
};
