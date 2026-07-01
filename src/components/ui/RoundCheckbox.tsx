"use client";

import { BsCheck } from "react-icons/bs";

type RoundCheckboxProps = {
    checked: boolean;
    indeterminate?: boolean;
    onToggle: () => void;
    className?: string;
};

export default function RoundCheckbox({ checked, indeterminate = false, onToggle, className = "" }: RoundCheckboxProps) {
    const active = checked || indeterminate;

    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={indeterminate ? "mixed" : checked}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-200 active:scale-90 ${
                active
                    ? "bg-emerald-600 border-emerald-600"
                    : "bg-white border-gray-300 hover:border-emerald-400"
            } ${className}`}
        >
            {indeterminate && !checked ? (
                <span className="block w-3 h-[2px] rounded-full bg-white" />
            ) : (
                <BsCheck
                    className={`w-5 h-5 text-white transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`}
                />
            )}
        </button>
    );
}
