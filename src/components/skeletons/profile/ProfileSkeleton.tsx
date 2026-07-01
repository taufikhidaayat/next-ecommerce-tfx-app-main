import "react-loading-skeleton/dist/skeleton.css";
import PersonalSectionSkeleton from "./PersonalSectionSkeleton";
import AvatarSkeleton from "./AvatarSkeleton";

export default function ProfileSkeleton() {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Language Section */}
            <AvatarSkeleton />

            {/* Form Skeleton */}
            <PersonalSectionSkeleton />
        </div>
    );
}
