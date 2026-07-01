import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function FAQImageSkeleton() {
    return (
        <div className="relative w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
            <Skeleton height="100%" width="100%" borderRadius={12} />
        </div>
    );
}
