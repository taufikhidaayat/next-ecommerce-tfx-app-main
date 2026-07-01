import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function PaymentInformationSkeleton() {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border space-y-4">
            <Skeleton width={180} height={20} />
            <Skeleton height={1} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton circle height={16} width={16} />
                        <Skeleton height={14} width={100} />
                    </div>
                ))}
            </div>
            <Skeleton height={14} width="100%" />
        </div>
    );
}
