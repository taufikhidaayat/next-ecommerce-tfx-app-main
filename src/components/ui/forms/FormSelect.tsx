"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

type Option = {
    value: string | number;
    label: string;
};

type FormSelectProps = {
    label: string;
    id: string;
    name?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Option[];
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    isLoading?: boolean;
};

// Dropdown pilihan untuk form (label + opsi). Dipakai di form-form toko.
export default function FormSelect({
    label,
    id,
    name,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
    placeholder = "Select an option",
    isLoading = false,
}: FormSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isDisabled = disabled || isLoading;

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

    const selectedLabel = options.find((o) => o.value === value)?.label;

    const handleSelect = (val: string | number) => {
        onChange({
            target: { name: name ?? id, value: String(val) },
        } as unknown as React.ChangeEvent<HTMLSelectElement>);
        setOpen(false);
    };

    return (
        <div>
            <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-gray-700 pl-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div ref={containerRef} className="relative mt-2">
                {/* Hidden native input keeps native "required" validation working */}
                <input
                    type="text"
                    id={id}
                    name={name ?? id}
                    value={value === "" || value === undefined ? "" : String(value)}
                    onChange={() => {}}
                    required={required}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="sr-only"
                />

                <button
                    type="button"
                    onClick={() => !isDisabled && setOpen((o) => !o)}
                    disabled={isDisabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className="flex w-full items-center gap-2 px-3.5 py-3 sm:py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-left text-base transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span className={`flex-1 truncate ${selectedLabel ? "text-emerald-700" : "text-gray-400"}`}>
                        {isLoading ? "Loading..." : selectedLabel ?? placeholder}
                    </span>
                    <FiChevronDown
                        size={18}
                        className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {open && !isLoading && (
                    <div
                        role="listbox"
                        className="absolute top-full left-0 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={value === opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`w-full text-left px-3.5 py-2.5 text-base transition hover:bg-emerald-50 ${
                                    value === opt.value
                                        ? "bg-emerald-100 text-emerald-700 font-semibold"
                                        : "text-gray-700"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
