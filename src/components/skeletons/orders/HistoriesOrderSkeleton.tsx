import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function HistoriesOrderSkeleton() {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border space-y-4">
            <Skeleton width={140} height={20} />
            <Skeleton height={1} />
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <Skeleton width={200} height={14} />
                        <Skeleton width={150} height={12} />
                    </div>
                ))}
            </div>
        </div>
    );
}
