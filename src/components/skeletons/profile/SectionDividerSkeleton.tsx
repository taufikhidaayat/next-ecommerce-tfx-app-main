import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SectionDividerSkeleton() {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-grow border-t border-emerald-200" />
            <span className="text-sm font-semibold bg-white px-2 text-emerald-400">
                <Skeleton width={120} height={16} />
            </span>
            <div className="flex-grow border-t border-emerald-200" />
        </div>
    );
}