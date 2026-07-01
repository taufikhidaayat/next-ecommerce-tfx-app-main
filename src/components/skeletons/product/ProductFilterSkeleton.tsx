import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductFilterSkeleton() {
    return (
        <>
            {/* Mobile: satu tombol filter saja */}
            <div className="sm:hidden mb-6">
                <Skeleton height={40} width={120} borderRadius={8} />
            </div>

            {/* Desktop: filter bar penuh */}
            <div className="hidden sm:flex justify-between items-center mb-8">
                <div className="flex flex-wrap gap-4">
                    {Array(3).fill(null).map((_, idx) => (
                        <div key={idx}>
                            <Skeleton height={40} width={192} borderRadius={8} />
                        </div>
                    ))}
                </div>
                <div className="ml-auto">
                    <Skeleton height={40} width={192} borderRadius={8} />
                </div>
            </div>
        </>
    );
}
