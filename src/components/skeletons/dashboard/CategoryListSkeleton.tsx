import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function CategoryListSkeleton() {
    const letters = Array.from({ length: 3 }, (_, i) => String.fromCharCode(65 + i));
    const itemsPerLetter = 8;

    return (
        <div className="space-y-12">
            {letters.map((letter) => (
                <div
                    key={letter}
                    className="grid grid-cols-[80px_1fr] gap-6 items-start"
                >
                    {/* Huruf Kapital Artistik */}
                    <div className="relative">
                        <div className="sticky top-24">
                            <span className="text-5xl font-extrabold text-gray-200 block leading-[1]">
                                {letter}
                            </span>
                            <div className="w-6 h-1 bg-green-100 mt-2 rounded-full" />
                        </div>
                    </div>

                    {/* List Kategori Skeleton */}
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Array.from({ length: itemsPerLetter }).map((_, idx) => (
                            <li
                                key={idx}
                                className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm"
                            >
                                <Skeleton height={20} width="80%" />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
