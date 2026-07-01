import { SortOrder } from "@/enum/sortOrder";
import { useTranslations } from "next-intl";

export function FilterSelect({
    label,
    options,
    onChange,
    value,
    isSort = false,
}: {
    label: string
    options: { label: string; value: string }[]
    onChange: (val: string | SortOrder) => void
    value?: string
    isSort?: boolean
}) {
    const t = useTranslations("products.filter");
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 rounded-md border text-xs sm:text-sm text-green-800 bg-white hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500"
        >
            {!isSort && (
                <option value="">{`${t.raw("all")} ${label}`}</option>
            )}
            {options.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
}