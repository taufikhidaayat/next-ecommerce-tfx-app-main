import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SectionDividerSkeleton from "./SectionDividerSkeleton";

export default function PersonalSectionSkeleton() {
    return (
        <div className="md:w-3/4 w-full bg-white rounded-2xl shadow-md px-8 py-10 space-y-8 border border-gray-100">
            {/* Section Divider - General Settings */}
            <SectionDividerSkeleton />

            {/* Language Select */}
            <div className="space-y-2">
                <Skeleton width="30%" height={16} />
                <Skeleton height={44} />
            </div>

            <SectionDividerSkeleton />

            {/* Full Name, Email, Phone, Address, Birth Date */}
            {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton width="30%" height={16} />
                    <Skeleton height={40} />
                </div>
            ))}

            {/* Gender Select */}
            <div className="space-y-2">
                <Skeleton width="30%" height={16} />
                <Skeleton height={44} />
            </div>

            {/* Save Button */}
            <div className="pt-6 flex justify-end">
                <Skeleton width={120} height={40} />
            </div>
        </div>
    );
}
