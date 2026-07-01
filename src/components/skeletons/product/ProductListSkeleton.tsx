import { ProductCardSkeleton } from "./ProductCardSkeleton";

export const ProductListSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
            ))}
        </div>
    );
};
