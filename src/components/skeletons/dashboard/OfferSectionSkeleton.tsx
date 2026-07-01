import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function OfferSectionSkeleton() {
    return (
        <section className="w-full py-7 px-4">
            <div className="max-h-[400px] overflow-hidden rounded-lg">
                <Skeleton height={400} borderRadius={12} />
            </div>
        </section>
    );
}
