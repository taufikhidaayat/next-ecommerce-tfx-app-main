import { BrandCardSkeleton } from "./BrandCardSkeleton";

export const BrandListSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
                <BrandCardSkeleton key={idx} />
            ))}
        </div>
    );
};
