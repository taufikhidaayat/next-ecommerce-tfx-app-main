import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OrderSummarySkeleton() {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border space-y-4">
            <Skeleton width={150} height={20} />
            <Skeleton height={1} />
            <div className="space-y-2 max-h-[300px] pr-2">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} height={50} />
                ))}
            </div>
            <div className="space-y-2 text-sm text-gray-700 font-bold">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                        <Skeleton width={100} height={14} />
                        <Skeleton width={80} height={14} />
                    </div>
                ))}
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
                <Skeleton width={80} height={16} />
                <Skeleton width={100} height={16} />
            </div>
            <Skeleton height={40} />
        </div>
    );
}
