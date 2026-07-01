import { Checkbox } from "@/components/ui/button/Checkbox";
import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { MdRefresh, MdTune } from "react-icons/md";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { useTranslations } from "next-intl";

type FilterProps = {
    selectedRatings: string[];
    onRatingChange: (ratings: string[]) => void;
    hasMedia: boolean;
    onMediaChange: (value: boolean) => void;
    isPending: boolean;
};

export function ReviewFilterSection({
    selectedRatings,
    onRatingChange,
    hasMedia,
    onMediaChange,
    isPending
}: FilterProps) {
    const ratings = [5, 4, 3, 2, 1];
    const t = useTranslations("products.review.filter");
    const activeCount = selectedRatings.length + (hasMedia ? 1 : 0);

    const [openSections, setOpenSections] = useState({
        review: true,
        rating: true,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleRating = (star: number) => {
        if (selectedRatings.includes(star.toString())) {
            onRatingChange(selectedRatings.filter((r) => r !== star.toString()));
        } else {
            onRatingChange([...selectedRatings, star.toString()]);
        }
    };

    const onResetFilters = () => {
        onRatingChange([]);
        onMediaChange(false);
    };

    return (
        <aside
            className={`
                md:col-span-1 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 font-inter w-full max-w-full md:max-w-md
                relative transition-all duration-300
                ${isPending ? "opacity-75" : "opacity-100"}
            `}
        >
            <div className="flex items-center justify-between mb-5 relative z-20">
                <div className="flex items-center gap-2">
                    <MdTune size={18} className="text-green-600" />
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                        {t("title")}
                    </h3>
                    {activeCount > 0 && (
                        <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                </div>
                {(selectedRatings.length > 0 || hasMedia) && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="p-2 rounded-full text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t("reset")}
                        disabled={isPending}
                    >
                        <MdRefresh size={18} />
                    </button>
                )}
            </div>

            <div className="mb-5 relative z-20">
                <button
                    type="button"
                    className="w-full flex items-center justify-between mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => toggleSection("review")}
                    disabled={isPending}
                >
                    <p className="text-base font-semibold text-neutral-700">{t("review")}</p>
                    {openSections.review ? (
                        <RiArrowUpSLine className="text-gray-500" size={18} />
                    ) : (
                        <RiArrowDownSLine className="text-gray-500" size={18} />
                    )}
                </button>
                {openSections.review && (
                    <label className={`flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${hasMedia ? "bg-green-50" : "hover:bg-gray-50"} ${isPending ? "opacity-50 select-none pointer-events-none" : ""}`}>
                        <Checkbox checked={hasMedia} onChange={onMediaChange} disabled={isPending} />
                        <span className="text-sm font-medium text-neutral-800">
                            {t("withMedia")}
                        </span>
                    </label>
                )}
            </div>
            <div className="h-px bg-gray-100 mb-4 relative z-20" />

            <div className="relative z-20">
                <button
                    type="button"
                    className="w-full flex items-center justify-between mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => toggleSection("rating")}
                    disabled={isPending}
                >
                    <p className="text-base font-semibold text-neutral-700">{t("rating")}</p>
                    {openSections.rating ? (
                        <RiArrowUpSLine className="text-gray-500" size={18} />
                    ) : (
                        <RiArrowDownSLine className="text-gray-500" size={18} />
                    )}
                </button>
                {openSections.rating && (
                    <div className="space-y-1">
                        {ratings.map((star) => {
                            const checked = selectedRatings.includes(star.toString());
                            return (
                                <label
                                    key={star}
                                    className={`flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${checked ? "bg-green-50" : "hover:bg-gray-50"} ${isPending ? "opacity-50 select-none pointer-events-none" : ""}`}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => toggleRating(star)}
                                        disabled={isPending}
                                    />
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }, (_, i) =>
                                            i < star ? (
                                                <AiFillStar key={i} className="text-yellow-400" size={16} />
                                            ) : (
                                                <AiOutlineStar key={i} className="text-gray-300" size={16} />
                                            )
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}