import ProductDetailSkeleton from "@/components/skeletons/product/ProductDetailSkeleton";

export default function Loading() {
    return (
        <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="container w-full px-2 sm:px-4 pt-3 pb-5 mx-auto">
                <div className="container mx-auto py-2 flex flex-col lg:flex-row gap-6 lg:gap-12">
                    <ProductDetailSkeleton />
                </div>
            </div>
        </div>
    );
}
