"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";

type Option = { label: string; value: string };

export function SearchableFilterSelect({
    label,
    options,
    onChange,
    value,
    hideAllOption = false,
    hideSearch = false,
}: {
    label: string;
    options: Option[];
    onChange: (val: string) => void;
    value?: string;
    hideAllOption?: boolean;
    hideSearch?: boolean;
}) {
    const t = useTranslations("products.filter");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (open) {
            const id = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(id);
        }
        setSearch("");
    }, [open]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const allLabel = `${t.raw("all")} ${label}`;
    const selectedLabel = value
        ? options.find((o) => o.value === value)?.label ?? allLabel
        : allLabel;

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 min-w-[160px] sm:min-w-[180px] px-3 py-2 rounded-md border text-xs sm:text-sm text-green-800 bg-white hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500"
            >
                <span className="flex-1 text-left truncate">{selectedLabel}</span>
                <FiChevronDown
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    size={14}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-[220px] max-h-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 flex flex-col overflow-hidden">
                    {!hideSearch && (
                        <div className="p-2 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <FiSearch
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={14}
                                />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t.raw("searchInDropdown")}
                                    className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500 text-gray-700"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            inputRef.current?.focus();
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="Clear search"
                                    >
                                        <FiX size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto flex-1">
                        {!hideAllOption && (
                            <button
                                type="button"
                                onClick={() => handleSelect("")}
                                className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-green-50 transition ${!value ? "bg-green-100 text-green-800 font-semibold" : "text-gray-700"}`}
                            >
                                {allLabel}
                            </button>
                        )}

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-green-50 transition ${value === opt.value ? "bg-green-100 text-green-800 font-semibold" : "text-gray-700"}`}
                                >
                                    {opt.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">
                                {t.raw("noResults")}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
