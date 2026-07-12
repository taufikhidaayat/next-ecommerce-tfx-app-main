type SectionDividerProps = {
    label: string;
    className?: string;
};

// Garis pemisah antar bagian, opsional dengan teks label di tengahnya.
export function SectionDivider({ label, className = "" }: SectionDividerProps) {
    return (
        <div className={`flex items-center gap-4 pt-6 ${className}`}>
            <div className="flex-grow border-t border-emerald-400" />
            <span className="text-sm text-emerald-700 font-semibold bg-white px-2">
                {label}
            </span>
            <div className="flex-grow border-t border-emerald-400" />
        </div>
    );
}
