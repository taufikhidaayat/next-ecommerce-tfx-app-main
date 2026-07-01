import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OrdersSkeleton() {
    return (
        <div>
            <div className="flex w-full gap-2 rounded-2xl border border-green-200 bg-green-50 p-2 shadow-sm my-4 overflow-x-auto no-scrollbar flex-nowrap md:overflow-x-visible md:flex-wrap">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-shrink-0 min-w-[100px] md:min-w-0 md:flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 bg-green-100"
                    >
                        <Skeleton width={50} height={16} />
                        <Skeleton width={20} height={20} borderRadius="50%" />
                    </div>
                ))}
            </div>

            {[...Array(3)].map((_, idx) => (
                <div
                    key={idx}
                    className="bg-white border rounded-xl shadow p-6 mb-6 animate-pulse"
                >
                    {/* Header skeleton */}
                    <div className="flex justify-between items-center pb-4 border-b mb-4">
                        <div className="flex items-center space-x-2">
                            <Skeleton circle={true} height={32} width={32} />
                            <Skeleton width={120} height={24} />
                        </div>
                        <Skeleton width={100} height={24} />
                    </div>

                    {/* Items skeleton */}
                    <div className="space-y-4 mb-4">
                        {[...Array(2)].map((__, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton width={56} height={56} borderRadius={12} />
                                <div className="flex-1 space-y-2">
                                    <Skeleton height={20} width="80%" />
                                    <Skeleton height={14} width="60%" />
                                    <Skeleton height={14} width="40%" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer skeleton */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <Skeleton width={100} height={24} />
                        <Skeleton width={80} height={32} borderRadius={6} />
                    </div>
                </div>
            ))}
        </div>
    );
}
