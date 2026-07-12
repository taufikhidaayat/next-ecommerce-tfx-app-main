import { useState } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

type RatingStarProps = {
    value?: number;
    onChange?: (val: number) => void;
    className?: string;
    label?: string;
};

// Deretan bintang rating. Bila onChange diberikan → bisa diklik (mode input rating);
// tanpa onChange → hanya menampilkan (read-only), mis. rata-rata rating produk.
export default function RatingStars({ value = 0, onChange, className }: RatingStarProps) {
    const [hover, setHover] = useState(0);
    const isEditable = typeof onChange === "function";
    const displayValue = hover || value;

    const renderStar = (star: number) => {
        if (displayValue >= star) {
            return <FaStar className="w-full h-full text-yellow-400" />;
        } else if (displayValue >= star - 0.5) {
            return <FaStarHalfAlt className="w-full h-full text-yellow-400" />;
        } else {
            return <FaStar className="w-full h-full text-gray-300" />;
        }
    };

    return (
        <div className={className ? className : "flex w-full gap-2"}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`flex-1 aspect-square flex items-center justify-center 
                        ${isEditable ? "focus:outline-none" : "pointer-events-none"}`}
                    onClick={() => isEditable && onChange(star)}
                    onMouseEnter={() => isEditable && setHover(star)}
                    onMouseLeave={() => isEditable && setHover(0)}
                >
                    {renderStar(star)}
                </button>
            ))}
        </div>
    );
}
