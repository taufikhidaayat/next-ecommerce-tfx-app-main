import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OrderFlowSkeleton() {
    return (
        <div className="flex items-center w-full max-w-4xl mx-auto px-6 py-8 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="flex items-center gap-4 w-full">
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton circle width={40} height={40} />
                        <Skeleton width={60} height={10} />
                    </div>
                    {index !== 2 && <Skeleton height={2} width="100%" />}
                </div>
            ))}
        </div>
    );
}
