import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function AvatarSkeleton() {
    return (
        <div className="md:w-1/4 w-full space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center shadow">
                <Skeleton circle width={128} height={128} />
                <div className="mt-4 w-28">
                    <Skeleton height={32} />
                </div>
            </div>
        </div>
    );
}