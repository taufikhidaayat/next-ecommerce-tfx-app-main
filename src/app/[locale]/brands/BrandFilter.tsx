import { SortOrder } from "@/enum/sortOrder";
import { FilterSelect } from "../products/FilterSelect";
import { FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";

type BrandFilterProps = {
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    sortOptions: { value: string; label: string }[];
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function BrandFilter({
    sortOptions,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    onSearchChange,
}: BrandFilterProps) {
    const t = useTranslations("brands.filter");
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-5 md:mb-8">
            {/* Sort by */}
            <FilterSelect
                label={t("sortLabel")}
                options={sortOptions.map((s) => ({
                    label: s.label,
                    value: `${s.value}`,
                }))}
                onChange={(val) => {
                    const [order] = val.split("-");
                    setSortOrder(order as SortOrder);
                }}
                isSort={true}
            />

            {/* Search */}
            <div className="relative w-full sm:w-48 md:w-60 group">
                <span className="absolute inset-y-0 left-3 flex items-center text-green-700 group-hover:text-green-700 group-focus-within:text-green-700 transition-colors">
                    <FaSearch size={16} className="md:size-[18px]" />
                </span>
                <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={onSearchChange || ((e) => setSearchQuery(e.target.value))}
                    className="pl-9 md:pl-10 pr-3 py-1.5 md:py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base text-gray-800 transition-colors group-hover:bg-green-50"
                />
            </div>
        </div>
    );
}