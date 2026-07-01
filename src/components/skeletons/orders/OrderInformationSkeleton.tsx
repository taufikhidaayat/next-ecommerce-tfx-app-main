import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OrderInformationSkeleton() {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border space-y-4">
            <Skeleton width={160} height={20} />
            <Skeleton height={1} />
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={100} height={14} />
                </div>
            ))}
        </div>
    );
}
