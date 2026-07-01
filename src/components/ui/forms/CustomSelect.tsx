"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

type Option = { value: string | number; label: string; badge?: ReactNode; disabled?: boolean };

type CustomSelectProps = {
    label?: ReactNode;
    id: string;
    value: string | number;
    onChange: (value: string) => void;
    options: Option[];
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
};

export default function CustomSelect({
    label,
    id,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
    placeholder = "Pilih opsi",
}: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => String(o.value) === String(value));

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) {
            document.addEventListener("mousedown", handleClick);
            document.addEventListener("keydown", handleEsc);
            return () => {
                document.removeEventListener("mousedown", handleClick);
                document.removeEventListener("keydown", handleEsc);
            };
        }
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-gray-700 pl-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className={`w-full mt-2 flex items-center justify-between gap-2 px-3.5 py-3 sm:py-3.5 rounded-xl border bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-base transition-all duration-200 ${
                    open ? "bg-white border-emerald-500 ring-4 ring-emerald-500/15" : "border-gray-200"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <span className={`flex-1 flex items-center gap-2 text-left min-w-0 ${selected ? "text-emerald-700 font-medium" : "text-gray-400"}`}>
                    <span className="truncate min-w-0">{selected?.label || placeholder}</span>
                    {selected?.badge && <span className="shrink-0">{selected.badge}</span>}
                </span>
                <FiChevronDown
                    className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    size={16}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-30 animate-fade-in">
                    {options.map((opt) => {
                        const isActive = String(opt.value) === String(value);
                        const isDisabled = !!opt.disabled;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                    if (isDisabled) return;
                                    onChange(String(opt.value));
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 text-base text-left transition-colors ${
                                    isDisabled
                                        ? "text-gray-400 cursor-not-allowed bg-gray-50/60"
                                        : isActive
                                            ? "bg-emerald-50 text-emerald-700 font-semibold"
                                            : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <span className="flex-1 flex items-center gap-2 min-w-0">
                                    <span className="truncate min-w-0">{opt.label}</span>
                                    {opt.badge && <span className="shrink-0">{opt.badge}</span>}
                                </span>
                                {isActive && !isDisabled && <FiCheck className="shrink-0 text-emerald-600" size={16} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
