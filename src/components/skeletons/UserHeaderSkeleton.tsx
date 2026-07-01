import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function UserHeaderSkeleton() {
    return (
        <div className="flex items-center space-x-2 ml-4">
            <Skeleton
                circle
                width={36}
                height={36}
                containerClassName="rounded-full"
            />

            <Skeleton
                circle
                width={40}
                height={40}
                containerClassName="rounded-full"
            />
        </div>
    );
}
